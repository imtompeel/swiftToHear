import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebRTCService } from '../webrtcService';

vi.mock('../firebaseSignalingService', () => ({
  FirebaseSignalingService: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    sendJoinMessage: vi.fn().mockResolvedValue(undefined),
    cleanup: vi.fn().mockResolvedValue(undefined),
  })),
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

describe('WebRTCService', () => {
  let service: WebRTCService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = WebRTCService.getInstance();
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
});
