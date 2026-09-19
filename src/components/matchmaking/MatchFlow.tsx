import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAudiencePreference } from '../../hooks/useAudiencePreference';
import { useTranslation } from '../../hooks/useTranslation';
import {
  broadenAudience,
  type AudiencePreference,
} from '../../services/audiencePreference';
import { isChristadelphianUnlocked } from '../../services/christadelphianGate';
import { MatchmakingService } from '../../services/matchmakingService';
import {
  MATCH_HEARTBEAT_INTERVAL_MS,
  type MatchMode,
  type MatchRoom,
} from '../../types/matchmaking';
import { ChristadelphianGateForm } from '../ChristadelphianGateForm';
import { MatchModeChoice } from './MatchModeChoice';
import { MatchNameForm } from './MatchNameForm';
import { MatchWaitingRoom } from './MatchWaitingRoom';

type MatchStep = 'mode' | 'name' | 'waiting';

const MATCH_ACTIVE_ROOM_KEY = 'swiftToHear.activeMatchRoom';

function readStoredMatchRoom(): { roomId: string; userId: string } | null {
  try {
    // localStorage survives tab close; sessionStorage does not — we need the
    // room id to drop a seat if pagehide leave did not finish.
    const raw =
      localStorage.getItem(MATCH_ACTIVE_ROOM_KEY) ??
      sessionStorage.getItem(MATCH_ACTIVE_ROOM_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { roomId?: string; userId?: string };
    if (!parsed.roomId || !parsed.userId) return null;
    return { roomId: parsed.roomId, userId: parsed.userId };
  } catch {
    return null;
  }
}

function storeActiveMatchRoom(roomId: string, userId: string): void {
  try {
    const payload = JSON.stringify({ roomId, userId });
    localStorage.setItem(MATCH_ACTIVE_ROOM_KEY, payload);
    sessionStorage.removeItem(MATCH_ACTIVE_ROOM_KEY);
  } catch {
    // ignore
  }
}

function clearStoredMatchRoom(): void {
  try {
    localStorage.removeItem(MATCH_ACTIVE_ROOM_KEY);
    sessionStorage.removeItem(MATCH_ACTIVE_ROOM_KEY);
  } catch {
    // ignore
  }
}

export const MatchFlow: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { ensureSignedIn, user } = useAuth();
  const { preference, setPreference } = useAudiencePreference();

  const initialMode = searchParams.get('mode');
  const presetMode: MatchMode | null =
    initialMode === 'curious' || initialMode === 'full' ? initialMode : null;

  const [step, setStep] = useState<MatchStep>(presetMode ? 'name' : 'mode');
  const [mode, setMode] = useState<MatchMode | null>(presetMode);
  const [audience, setAudience] = useState<AudiencePreference | null>(preference);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [room, setRoom] = useState<MatchRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [broadening, setBroadening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [staleQueueCleared, setStaleQueueCleared] = useState(false);
  const [suggestBroaden, setSuggestBroaden] = useState(false);
  const [christadelphianUnlocked, setChristadelphianUnlocked] = useState(() =>
    isChristadelphianUnlocked()
  );

  const navigatingRef = useRef(false);
  const displayNameRef = useRef('');
  const roomIdRef = useRef<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  useEffect(() => {
    userIdRef.current = user?.uid ?? null;
  }, [user]);

  useEffect(() => {
    setAudience(preference);
  }, [preference]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensureSignedIn();
        if (!cancelled) setAuthReady(true);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError(t('matchmaking.errors.authFailed'));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ensureSignedIn, t]);

  // Drop any leftover queue seat from a previous tab/visit before matching again
  useEffect(() => {
    if (!authReady || !user) return;

    let cancelled = false;
    setStaleQueueCleared(false);

    (async () => {
      try {
        const stored = readStoredMatchRoom();
        if (stored && stored.userId === user.uid) {
          await MatchmakingService.leaveQueue(stored.roomId, stored.userId);
        }
        await MatchmakingService.leaveAllQueuesForUser(user.uid);
      } catch (err) {
        console.warn('Failed to clear stale match queue:', err);
      } finally {
        clearStoredMatchRoom();
        if (!cancelled) setStaleQueueCleared(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authReady, user?.uid]);

  // Leave the queue on navigate-away or tab close (React cleanup alone is unreliable on unload)
  useEffect(() => {
    const leaveIfWaiting = () => {
      if (navigatingRef.current) return;
      const activeRoomId = roomIdRef.current;
      const activeUserId = userIdRef.current;
      // Only act when this visit actually joined a room — otherwise we can
      // wipe the stored id before the stale-queue clearer has used it.
      if (!activeRoomId || !activeUserId) return;
      void MatchmakingService.leaveQueue(activeRoomId, activeUserId);
      clearStoredMatchRoom();
    };

    window.addEventListener('pagehide', leaveIfWaiting);
    window.addEventListener('beforeunload', leaveIfWaiting);

    return () => {
      window.removeEventListener('pagehide', leaveIfWaiting);
      window.removeEventListener('beforeunload', leaveIfWaiting);
      leaveIfWaiting();
    };
  }, []);

  // Subscribe to room + heartbeat
  useEffect(() => {
    if (!roomId || !user) return;

    const unsubscribe = MatchmakingService.subscribeToRoom(roomId, (next) => {
      setRoom(next);
      if (next?.status === 'matched' && next.matchedSessionId && !navigatingRef.current) {
        navigatingRef.current = true;
        clearStoredMatchRoom();
        navigate(`/practice?sessionId=${next.matchedSessionId}`, { replace: true });
      }
    });

    const heartbeat = window.setInterval(() => {
      void MatchmakingService.heartbeat(roomId, user.uid);
    }, MATCH_HEARTBEAT_INTERVAL_MS);

    return () => {
      unsubscribe();
      window.clearInterval(heartbeat);
    };
  }, [roomId, user, navigate]);

  // Suggest broadening when alone in a narrower funnel pool
  useEffect(() => {
    if (step !== 'waiting' || !mode || !audience || !user) {
      setSuggestBroaden(false);
      return;
    }

    const nextAudience = broadenAudience(audience);
    if (!nextAudience) {
      setSuggestBroaden(false);
      return;
    }

    const aloneInRoom = !room || room.participants.length <= 1;
    if (!aloneInRoom) {
      setSuggestBroaden(false);
      return;
    }

    let cancelled = false;
    const check = async () => {
      try {
        const others = await MatchmakingService.hasOthersWaiting({
          mode,
          audience,
          excludeUserId: user.uid,
        });
        if (!cancelled) setSuggestBroaden(!others);
      } catch {
        if (!cancelled) setSuggestBroaden(false);
      }
    };

    void check();
    const interval = window.setInterval(() => {
      void check();
    }, 15_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [step, mode, audience, user, room]);

  const handleModeSelect = (selected: MatchMode) => {
    setMode(selected);
    setStep('name');
    setError(null);
  };

  const handleNameSubmit = useCallback(
    async (name: string) => {
      if (!mode || !staleQueueCleared) return;
      const pool = audience ?? preference ?? 'open';
      if (!audience) {
        setAudience(pool);
        setPreference(pool);
      }

      displayNameRef.current = name;
      setLoading(true);
      setError(null);
      try {
        const signedIn = await ensureSignedIn(name);
        await MatchmakingService.leaveAllQueuesForUser(signedIn.uid);
        const result = await MatchmakingService.joinQueue({
          mode,
          audience: pool,
          userId: signedIn.uid,
          userName: name,
        });
        storeActiveMatchRoom(result.roomId, signedIn.uid);
        setRoomId(result.roomId);
        setStep('waiting');
      } catch (err) {
        console.error(err);
        setError(t('matchmaking.errors.joinFailed'));
      } finally {
        setLoading(false);
      }
    },
    [mode, audience, preference, setPreference, ensureSignedIn, t, staleQueueCleared]
  );

  const handleBroaden = useCallback(async () => {
    if (!mode || !audience || !user) return;
    const next = broadenAudience(audience);
    if (!next) return;

    setBroadening(true);
    setError(null);
    try {
      if (roomId) {
        await MatchmakingService.leaveQueue(roomId, user.uid);
        clearStoredMatchRoom();
      }
      setPreference(next);
      setAudience(next);
      setSuggestBroaden(false);

      const name = displayNameRef.current || user.displayName || 'Guest';
      const result = await MatchmakingService.joinQueue({
        mode,
        audience: next,
        userId: user.uid,
        userName: name,
      });
      storeActiveMatchRoom(result.roomId, user.uid);
      setRoomId(result.roomId);
      setRoom(null);
    } catch (err) {
      console.error(err);
      setError(t('matchmaking.errors.joinFailed'));
    } finally {
      setBroadening(false);
    }
  }, [mode, audience, user, roomId, setPreference, t]);

  const handleCancel = useCallback(async () => {
    if (roomId && user) {
      await MatchmakingService.leaveQueue(roomId, user.uid);
    }
    clearStoredMatchRoom();
    setRoomId(null);
    setRoom(null);
    setSuggestBroaden(false);
    setStep('mode');
    setMode(null);
  }, [roomId, user]);

  if ((!authReady || !staleQueueCleared) && !error) {
    return (
      <div className="max-w-md mx-auto p-12 text-center" data-testid="match-flow">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-600 mx-auto mb-4" />
        <p className="text-secondary-600 dark:text-secondary-400">
          {t('matchmaking.loading')}
        </p>
      </div>
    );
  }

  if (!preference && !audience) {
    return (
      <div className="max-w-md mx-auto p-8 text-center space-y-4" data-testid="match-flow-need-audience">
        <h1 className="font-display text-2xl font-semibold text-secondary-900 dark:text-secondary-50">
          {t('matchmaking.needAudience.title')}
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400">
          {t('matchmaking.needAudience.body')}
        </p>
        <Link to="/?choose=1" className="btn-primary inline-flex">
          {t('matchmaking.needAudience.action')}
        </Link>
      </div>
    );
  }

  const activeAudience = audience ?? preference ?? 'open';
  if (activeAudience === 'christadelphian' && !christadelphianUnlocked) {
    return (
      <ChristadelphianGateForm
        onUnlocked={() => {
          setPreference('christadelphian');
          setAudience('christadelphian');
          setChristadelphianUnlocked(true);
        }}
      />
    );
  }

  const broadenTo = broadenAudience(activeAudience);

  return (
    <div className="min-h-[70vh] py-8" data-testid="match-flow">
      {error && (
        <div className="max-w-md mx-auto mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-sm">
          {error}
        </div>
      )}

      {step === 'mode' && (
        <MatchModeChoice audience={activeAudience} onSelect={handleModeSelect} />
      )}

      {step === 'name' && mode && (
        <MatchNameForm
          defaultName={user?.displayName || ''}
          onSubmit={handleNameSubmit}
          onBack={() => {
            setStep('mode');
            setMode(null);
          }}
          loading={loading}
        />
      )}

      {step === 'waiting' && mode && (
        <MatchWaitingRoom
          mode={mode}
          audience={activeAudience}
          room={room}
          onCancel={handleCancel}
          broadenTo={suggestBroaden ? broadenTo : null}
          onBroaden={handleBroaden}
          broadening={broadening}
        />
      )}
    </div>
  );
};

export default MatchFlow;
