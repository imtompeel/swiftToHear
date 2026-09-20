import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { SessionVideo } from '../SessionVideo';

vi.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    isLoading: false,
  }),
}));

const createStream = () => {
  const audioTrack = { kind: 'audio', enabled: true } as MediaStreamTrack;
  return {
    active: true,
    getTracks: () => [audioTrack],
    getAudioTracks: () => [audioTrack],
    getVideoTracks: () => [],
  } as unknown as MediaStream;
};

const session = {
  sessionId: 'session-1',
  participants: [
    { id: 'user-1', name: 'Alice', role: 'speaker' },
    { id: 'user-2', name: 'Bob', role: 'listener' },
  ],
};

const baseVideoCall = {
  error: null,
  peerStreams: new Map<string, MediaStream>([['user-2', createStream()]]),
  localVideoRef: { current: null },
  isVideoEnabled: true,
  isMuted: false,
  isConnected: true,
  isConnecting: false,
  toggleMute: vi.fn(),
  toggleVideo: vi.fn(),
  localStreamRef: { current: null },
  reconnectCall: vi.fn(),
};

describe('SessionVideo safety timeout audio', () => {
  it('mutes a peer who has requested a safety timeout so others cannot hear them', () => {
    const stream = createStream();
    render(
      <SessionVideo
        session={session}
        videoCall={{ ...baseVideoCall, peerStreams: new Map([['user-2', stream]]) }}
        showSelfVideo={false}
        onToggleSelfVideo={vi.fn()}
        currentUserId="user-1"
        safetyTimeout={{
          isTimeoutActive: true,
          requestedByMe: false,
          timeoutState: { requestedBy: 'user-2' },
        }}
      />
    );

    expect(screen.getByTestId('peer-video-user-2')).toHaveProperty('muted', true);
    expect(stream.getAudioTracks()[0].enabled).toBe(false);
  });

  it('leaves other peers unmuted when someone else is in timeout', () => {
    const stream = createStream();
    render(
      <SessionVideo
        session={session}
        videoCall={{ ...baseVideoCall, peerStreams: new Map([['user-2', stream]]) }}
        showSelfVideo={false}
        onToggleSelfVideo={vi.fn()}
        currentUserId="user-2"
        safetyTimeout={{
          isTimeoutActive: true,
          requestedByMe: false,
          timeoutState: { requestedBy: 'user-1' },
        }}
      />
    );

    expect(screen.getByTestId('peer-video-user-2')).toHaveProperty('muted', false);
    expect(stream.getAudioTracks()[0].enabled).toBe(true);
  });
});
