import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  WebRTCService,
  computeIntervalPacketLoss,
  ICE_DISCONNECT_GRACE_MS,
} from '../webrtcService';

const { signalingMock } = vi.hoisted(() => ({
  signalingMock: {
    initialize: vi.fn().mockResolvedValue(undefined),
    sendJoinMessage: vi.fn().mockResolvedValue(undefined),
    sendLeaveMessage: vi.fn().mockResolvedValue(undefined),
    sendOffer: vi.fn().mockResolvedValue(undefined),
    sendAnswer: vi.fn().mockResolvedValue(undefined),
    sendIceCandidate: vi.fn().mockResolvedValue(undefined),
    onMessage: vi.fn(),
    disconnect: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../firebaseSignalingService', () => ({
  FirebaseSignalingService: {
    getInstance: () => signalingMock,
  },
}));

const mockGetUserMedia = vi.fn().mockResolvedValue({
  getTracks: () => [{ kind: 'video', stop: vi.fn() }, { kind: 'audio', stop: vi.fn() }],
  getVideoTracks: () => [{ stop: vi.fn() }],
  getAudioTracks: () => [{ stop: vi.fn(), getSettings: vi.fn(), getCapabilities: vi.fn() }],
});

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: { getUserMedia: mockGetUserMedia },
  configurable: true,
});

class MockRTCPeerConnection {
  connectionState: RTCPeerConnectionState = 'new';
  iceConnectionState: RTCIceConnectionState = 'new';
  signalingState: RTCSignalingState = 'stable';
  ontrack: ((event: { streams: MediaStream[] }) => void) | null = null;
  onicecandidate: ((event: { candidate: RTCIceCandidate | null }) => void) | null = null;
  onconnectionstatechange: (() => void) | null = null;
  oniceconnectionstatechange: (() => void) | null = null;
  addTrack = vi.fn();
  close = vi.fn(() => {
    this.signalingState = 'closed';
    this.connectionState = 'closed';
    this.onconnectionstatechange?.();
  });
  createOffer = vi.fn(async () => ({ type: 'offer', sdp: 'sdp' }));
  createAnswer = vi.fn(async () => ({ type: 'answer', sdp: 'sdp' }));
  setLocalDescription = vi.fn(async () => {});
  setRemoteDescription = vi.fn(async () => {});
  addIceCandidate = vi.fn(async () => {});
  restartIce = vi.fn();
  getStats = vi.fn(async () => new Map());
  getSenders = vi.fn(() => []);

  simulateConnectionState(state: RTCPeerConnectionState) {
    this.connectionState = state;
    this.onconnectionstatechange?.();
  }

  simulateIceState(state: RTCIceConnectionState) {
    this.iceConnectionState = state;
    this.oniceconnectionstatechange?.();
  }

  simulateTrack(stream: MediaStream) {
    this.ontrack?.({ streams: [stream] });
  }
}

describe('computeIntervalPacketLoss', () => {
  it('treats the first sample as a baseline rather than a loss rate', () => {
    expect(computeIntervalPacketLoss(undefined, {
      packetsLost: 8,
      packetsReceived: 11,
    })).toEqual({ lossRate: 0, sampleSize: 0 });
  });

  it('measures loss over the interval, not the whole call', () => {
    const { lossRate, sampleSize } = computeIntervalPacketLoss(
      { packetsLost: 8, packetsReceived: 11 },
      { packetsLost: 9, packetsReceived: 111 }
    );

    expect(lossRate).toBeCloseTo(1 / 101);
    expect(sampleSize).toBe(101);
  });
});

describe('WebRTCService', () => {
  let service: WebRTCService;
  let lastPeer: MockRTCPeerConnection | null;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    lastPeer = null;
    vi.stubGlobal(
      'RTCPeerConnection',
      vi.fn(() => {
        lastPeer = new MockRTCPeerConnection();
        return lastPeer;
      })
    );
    service = WebRTCService.getInstance();
  });

  afterEach(async () => {
    await service.cleanup();
    vi.useRealTimers();
  });

  it('should expose a singleton instance', () => {
    expect(WebRTCService.getInstance()).toBe(service);
  });

  it('should initialise with session and user context', async () => {
    const onConnectionStateChange = vi.fn();

    await service.initialize('session-1', 'user-1', { onConnectionStateChange });

    await expect(
      service.joinSession([{ id: 'user-2', name: 'Peer' }])
    ).resolves.toBeUndefined();
  });

  it('should request local media with expected constraints', async () => {
    await service.initialize('session-1', 'user-1', {});
    await service.initializeLocalStream(true, true);

    expect(mockGetUserMedia).toHaveBeenCalledWith(
      expect.objectContaining({
        video: expect.anything(),
        audio: expect.anything(),
      })
    );
  });

  it('should clean up without throwing', async () => {
    await service.initialize('session-1', 'user-1', {});
    await expect(service.cleanup()).resolves.toBeUndefined();
  });

  it('does not treat a transient ICE disconnect as the participant leaving', async () => {
    const onParticipantLeft = vi.fn();
    const onParticipantJoined = vi.fn();
    const onConnectionStateChange = vi.fn();
    const onStreamReceived = vi.fn();

    await service.initialize('session-1', 'user-1', {
      onParticipantLeft,
      onParticipantJoined,
      onConnectionStateChange,
      onStreamReceived,
    });

    const peerConnection = await service.createPeerConnection('user-2');
    const stream = {
      active: true,
      getTracks: () => [{ kind: 'video' }],
    } as unknown as MediaStream;

    lastPeer!.simulateTrack(stream);
    lastPeer!.simulateConnectionState('connected');
    expect(onParticipantJoined).toHaveBeenCalledWith('user-2');
    expect(onStreamReceived).toHaveBeenCalledWith('user-2', stream);

    onStreamReceived.mockClear();
    lastPeer!.simulateIceState('disconnected');
    lastPeer!.simulateConnectionState('disconnected');

    expect(onParticipantLeft).not.toHaveBeenCalled();
    expect(onConnectionStateChange).toHaveBeenCalledWith('connecting');
    expect(service.getPeerConnections().get('user-2')?.connection).toBe(peerConnection);

    lastPeer!.simulateIceState('connected');
    lastPeer!.simulateConnectionState('connected');

    expect(onParticipantLeft).not.toHaveBeenCalled();
    expect(onStreamReceived).toHaveBeenCalledWith('user-2', stream);
  });

  it('restarts ICE if the disconnect lasts beyond the grace period', async () => {
    vi.useFakeTimers();
    await service.initialize('session-1', 'user-1', {});
    await service.createPeerConnection('user-2');

    lastPeer!.simulateConnectionState('disconnected');
    expect(lastPeer!.restartIce).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(ICE_DISCONNECT_GRACE_MS);

    expect(lastPeer!.restartIce).toHaveBeenCalledTimes(1);
    expect(lastPeer!.createOffer).toHaveBeenCalledWith({ iceRestart: true });
  });

  it('does not restart ICE if connectivity recovers during the grace period', async () => {
    vi.useFakeTimers();
    await service.initialize('session-1', 'user-1', {});
    await service.createPeerConnection('user-2');

    lastPeer!.simulateConnectionState('disconnected');
    lastPeer!.simulateConnectionState('connected');
    await vi.advanceTimersByTimeAsync(ICE_DISCONNECT_GRACE_MS);

    expect(lastPeer!.restartIce).not.toHaveBeenCalled();
  });
});
