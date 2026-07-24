import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
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

  const initialMode = searchParams.get('mode');
  const presetMode: MatchMode | null =
    initialMode === 'curious' || initialMode === 'full' ? initialMode : null;

  const [step, setStep] = useState<MatchStep>(presetMode ? 'name' : 'mode');
  const [mode, setMode] = useState<MatchMode | null>(presetMode);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [room, setRoom] = useState<MatchRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const navigatingRef = useRef(false);

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
      setLoading(true);
      setError(null);
      try {
        const signedIn = await ensureSignedIn(name);
        const result = await MatchmakingService.joinQueue({
          mode,
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
    [mode, ensureSignedIn, t]
  );

  const handleCancel = useCallback(async () => {
    if (roomId && user) {
      await MatchmakingService.leaveQueue(roomId, user.uid);
    }
    setRoomId(null);
    setRoom(null);
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

  return (
    <div className="min-h-[70vh] py-8" data-testid="match-flow">
      {error && (
        <div className="max-w-md mx-auto mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-sm">
          {error}
        </div>
      )}

      {step === 'mode' && <MatchModeChoice onSelect={handleModeSelect} />}

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
        <MatchWaitingRoom mode={mode} room={room} onCancel={handleCancel} />
      )}
    </div>
  );
};

export default MatchFlow;
