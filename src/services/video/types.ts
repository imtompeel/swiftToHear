/**
 * Video media provider abstraction.
 *
 * Default: mesh WebRTC (+ TURN).
 * Optional: Daily.co SFU when VITE_VIDEO_PROVIDER=daily.
 */

export type VideoConnectionState = 'connected' | 'connecting' | 'disconnected';

export interface VideoParticipant {
  id: string;
  name: string;
}

export interface VideoProviderCallbacks {
  onParticipantJoined?: (participantId: string) => void;
  onParticipantLeft?: (participantId: string) => void;
  onConnectionStateChange?: (state: VideoConnectionState) => void;
  onStreamReceived?: (participantId: string, stream: MediaStream) => void;
}

export interface VideoProvider {
  initialize(
    sessionId: string,
    currentUserId: string,
    callbacks: VideoProviderCallbacks,
    options?: { baseSessionId?: string }
  ): Promise<void>;

  initializeLocalStream(videoEnabled?: boolean, audioEnabled?: boolean): Promise<MediaStream>;
  joinSession(participants: VideoParticipant[]): Promise<void>;
  updateParticipants(participants: VideoParticipant[]): Promise<void>;
  leaveSession(): Promise<void>;
  disconnect(): Promise<void>;
  getLocalStream(): MediaStream | null;
  toggleAudio(enabled: boolean): void;
  toggleVideo(enabled: boolean): void;
}

export type VideoProviderKind = 'mesh' | 'daily';

export function getConfiguredVideoProvider(): VideoProviderKind {
  const raw = (import.meta.env.VITE_VIDEO_PROVIDER || 'mesh').toLowerCase().trim();
  return raw === 'daily' ? 'daily' : 'mesh';
}
