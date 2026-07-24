import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import type { VideoProvider, VideoProviderCallbacks, VideoParticipant } from './types';

interface DailyTokenResponse {
  token: string;
  roomUrl: string;
}

/**
 * Daily.co SFU provider.
 *
 * Requires a token endpoint that returns { token, roomUrl }.
 * Default: VITE_DAILY_TOKEN_URL (e.g. your server /api/daily/token).
 */
export class DailyVideoProvider implements VideoProvider {
  private call: DailyCall | null = null;
  private localStream: MediaStream | null = null;
  private sessionId: string | null = null;
  private currentUserId: string | null = null;
  private callbacks: VideoProviderCallbacks = {};
  private attachedParticipantIds = new Set<string>();

  async initialize(
    sessionId: string,
    currentUserId: string,
    callbacks: VideoProviderCallbacks
  ): Promise<void> {
    await this.disconnect();

    this.sessionId = sessionId;
    this.currentUserId = currentUserId;
    this.callbacks = callbacks;
    this.callbacks.onConnectionStateChange?.('connecting');

    this.call = DailyIframe.createCallObject({
      audioSource: true,
      videoSource: true,
      dailyConfig: {
        useDevicePreferenceCookies: true
      }
    });

    this.call
      .on('joined-meeting', () => {
        this.callbacks.onConnectionStateChange?.('connected');
      })
      .on('left-meeting', () => {
        this.callbacks.onConnectionStateChange?.('disconnected');
      })
      .on('error', (event) => {
        console.error('🔴 DAILY - Error:', event);
        this.callbacks.onConnectionStateChange?.('disconnected');
      })
      .on('participant-joined', (event) => {
        const participant = event?.participant;
        if (!participant || participant.local) return;
        this.attachedParticipantIds.add(participant.session_id);
        this.callbacks.onParticipantJoined?.(participant.user_id || participant.session_id);
        this.emitRemoteStream(participant.session_id);
      })
      .on('participant-updated', (event) => {
        const participant = event?.participant;
        if (!participant || participant.local) return;
        this.emitRemoteStream(participant.session_id);
      })
      .on('participant-left', (event) => {
        const participant = event?.participant;
        if (!participant || participant.local) return;
        this.attachedParticipantIds.delete(participant.session_id);
        this.callbacks.onParticipantLeft?.(participant.user_id || participant.session_id);
      })
      .on('track-started', (event) => {
        if (event?.participant && !event.participant.local) {
          this.emitRemoteStream(event.participant.session_id);
        }
      });
  }

  private emitRemoteStream(sessionParticipantId: string) {
    if (!this.call) return;
    const participants = this.call.participants();
    const participant = participants[sessionParticipantId];
    if (!participant || participant.local) return;

    const tracks: MediaStreamTrack[] = [];
    const videoTrack = participant.tracks?.video?.persistentTrack;
    const audioTrack = participant.tracks?.audio?.persistentTrack;
    if (videoTrack) tracks.push(videoTrack);
    if (audioTrack) tracks.push(audioTrack);
    if (tracks.length === 0) return;

    const stream = new MediaStream(tracks);
    const id = participant.user_id || participant.session_id;
    this.callbacks.onStreamReceived?.(id, stream);
  }

  async initializeLocalStream(videoEnabled = true, audioEnabled = true): Promise<MediaStream> {
    if (!this.call) {
      throw new Error('Daily call not initialised');
    }

    await this.call.setLocalVideo(videoEnabled);
    await this.call.setLocalAudio(audioEnabled);

    const localParticipant = this.call.participants().local;
    const tracks: MediaStreamTrack[] = [];
    const videoTrack = localParticipant?.tracks?.video?.persistentTrack;
    const audioTrack = localParticipant?.tracks?.audio?.persistentTrack;
    if (videoTrack) tracks.push(videoTrack);
    if (audioTrack) tracks.push(audioTrack);

    this.localStream = new MediaStream(tracks);
    return this.localStream;
  }

  private async fetchMeetingToken(): Promise<DailyTokenResponse> {
    const tokenUrl = import.meta.env.VITE_DAILY_TOKEN_URL?.trim();
    if (!tokenUrl) {
      throw new Error(
        'Daily SFU requires VITE_DAILY_TOKEN_URL (server endpoint that returns { token, roomUrl })'
      );
    }

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: this.sessionId,
        userId: this.currentUserId
      })
    });

    if (!response.ok) {
      throw new Error(`Daily token request failed: ${response.status}`);
    }

    return (await response.json()) as DailyTokenResponse;
  }

  async joinSession(_participants: VideoParticipant[]): Promise<void> {
    if (!this.call) {
      throw new Error('Daily call not initialised');
    }

    const { token, roomUrl } = await this.fetchMeetingToken();
    await this.call.join({ url: roomUrl, token, userName: this.currentUserId || 'Guest' });
  }

  async updateParticipants(_participants: VideoParticipant[]): Promise<void> {
    // SFU membership is driven by Daily; no-op for roster sync
  }

  async leaveSession(): Promise<void> {
    if (this.call) {
      try {
        await this.call.leave();
      } catch (error) {
        console.warn('🟡 DAILY - leave failed:', error);
      }
    }
    this.localStream = null;
    this.attachedParticipantIds.clear();
    this.callbacks.onConnectionStateChange?.('disconnected');
  }

  async disconnect(): Promise<void> {
    await this.leaveSession();
    if (this.call) {
      try {
        await this.call.destroy();
      } catch (error) {
        console.warn('🟡 DAILY - destroy failed:', error);
      }
      this.call = null;
    }
    this.sessionId = null;
    this.currentUserId = null;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  toggleAudio(enabled: boolean): void {
    this.call?.setLocalAudio(enabled);
    const audioTrack = this.localStream?.getAudioTracks()[0];
    if (audioTrack) audioTrack.enabled = enabled;
  }

  toggleVideo(enabled: boolean): void {
    this.call?.setLocalVideo(enabled);
    const videoTrack = this.localStream?.getVideoTracks()[0];
    if (videoTrack) videoTrack.enabled = enabled;
  }
}
