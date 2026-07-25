import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
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
import { MatchModeChoice } from './MatchModeChoice';
import { MatchNameForm } from './MatchNameForm';
import { MatchWaitingRoom } from './MatchWaitingRoom';

type MatchStep = 'mode' | 'name' | 'waiting';

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
  const [suggestBroaden, setSuggestBroaden] = useState(false);

  const navigatingRef = useRef(false);
  const displayNameRef = useRef('');

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

  // Subscribe to room + heartbeat
  useEffect(() => {
    if (!roomId || !user) return;

    const unsubscribe = MatchmakingService.subscribeToRoom(roomId, (next) => {
      setRoom(next);
      if (next?.status === 'matched' && next.matchedSessionId && !navigatingRef.current) {
        navigatingRef.current = true;
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

  // Leave queue on unmount if still waiting
  useEffect(() => {
    return () => {
      if (roomId && user && !navigatingRef.current) {
        void MatchmakingService.leaveQueue(roomId, user.uid);
      }
    };
  }, [roomId, user]);

  const handleModeSelect = (selected: MatchMode) => {
    setMode(selected);
    setStep('name');
    setError(null);
  };

  const handleNameSubmit = useCallback(
    async (name: string) => {
      if (!mode) return;
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
        const result = await MatchmakingService.joinQueue({
          mode,
          audience: pool,
          userId: signedIn.uid,
          userName: name,
        });
        setRoomId(result.roomId);
        setStep('waiting');
      } catch (err) {
        console.error(err);
        setError(t('matchmaking.errors.joinFailed'));
      } finally {
        setLoading(false);
      }
    },
    [mode, audience, preference, setPreference, ensureSignedIn, t]
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
    setRoomId(null);
    setRoom(null);
    setSuggestBroaden(false);
    setStep('mode');
    setMode(null);
  }, [roomId, user]);

  if (!authReady && !error) {
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
  if (activeAudience === 'christadelphian' && !isChristadelphianUnlocked()) {
    return <Navigate to="/christadelphian" replace />;
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
