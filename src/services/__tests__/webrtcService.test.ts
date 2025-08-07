import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebRTCService } from '../webrtcService';

// Mock WebRTC APIs
const mockRTCPeerConnection = vi.fn().mockImplementation(() => ({
  createOffer: vi.fn().mockResolvedValue({ type: 'offer', sdp: 'mock-sdp' }),
  createAnswer: vi.fn().mockResolvedValue({ type: 'answer', sdp: 'mock-sdp' }),
  setLocalDescription: vi.fn().mockResolvedValue(undefined),
  setRemoteDescription: vi.fn().mockResolvedValue(undefined),
  addIceCandidate: vi.fn().mockResolvedValue(undefined),
  addTrack: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  close: vi.fn(),
  connectionState: 'new',
  iceConnectionState: 'new'
}));

const mockGetUserMedia = vi.fn().mockResolvedValue({
  getTracks: vi.fn().mockReturnValue([
    { kind: 'video', stop: vi.fn() },
    { kind: 'audio', stop: vi.fn() }
  ])
});

// Setup global mocks
global.RTCPeerConnection = mockRTCPeerConnection;
global.navigator = {
  ...global.navigator,
  mediaDevices: {
    getUserMedia: mockGetUserMedia
  }
};

describe('WebRTCService', () => {
  let webrtcService: WebRTCService;

  beforeEach(() => {
    vi.clearAllMocks();
    webrtcService = new WebRTCService();
  });

  afterEach(() => {
    webrtcService.cleanup();
  });

  describe('Initialization', () => {
    it('should initialize with correct default state', () => {
      expect(webrtcService.isConnected).toBe(false);
      expect(webrtcService.participants).toEqual([]);
    });

    it('should request user media on initialization', async () => {
      await webrtcService.initialize();
      
      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: true,
        audio: true
      });
    });
  });

  describe('Three-User Connection Management', () => {
    it('should establish connections with exactly three participants', async () => {
      await webrtcService.initialize();
      
      // Simulate connecting to two other participants
      await webrtcService.connectToParticipant('user1');
      await webrtcService.connectToParticipant('user2');
      
      expect(webrtcService.participants).toHaveLength(2);
      expect(mockRTCPeerConnection).toHaveBeenCalledTimes(2);
    });

    it('should reject additional connections beyond three users', async () => {
      await webrtcService.initialize();
      
      // Connect to maximum participants
      await webrtcService.connectToParticipant('user1');
      await webrtcService.connectToParticipant('user2');
      
      // Attempt to connect fourth user
      const result = await webrtcService.connectToParticipant('user3');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Session full');
    });

    it('should handle participant disconnection gracefully', async () => {
      await webrtcService.initialize();
      await webrtcService.connectToParticipant('user1');
      await webrtcService.connectToParticipant('user2');
      
      // Simulate disconnection
      webrtcService.handleParticipantDisconnected('user1');
      
      expect(webrtcService.participants).toHaveLength(1);
      expect(webrtcService.participants[0].id).toBe('user2');
    });
  });

  describe('Session State Synchronization', () => {
    it('should broadcast session state changes to all participants', async () => {
      await webrtcService.initialize();
      await webrtcService.connectToParticipant('user1');
      await webrtcService.connectToParticipant('user2');
      
      const sessionState = {
        phase: 'practice',
        currentRound: 2,
        roles: {
          'current-user': 'speaker',
          'user1': 'listener',
          'user2': 'scribe'
        }
      };
      
      const broadcastSpy = vi.spyOn(webrtcService, 'broadcastSessionState');
      webrtcService.updateSessionState(sessionState);
      
      expect(broadcastSpy).toHaveBeenCalledWith(sessionState);
    });

    it('should handle incoming session state updates', () => {
      const onStateUpdateSpy = vi.fn();
      webrtcService.onSessionStateUpdate(onStateUpdateSpy);
      
      const newState = {
        phase: 'reflection',
        currentRound: 3,
        roles: {}
      };
      
      // Simulate receiving state update from another participant
      webrtcService.handleIncomingMessage({
        type: 'session-state-update',
        data: newState,
        from: 'user1'
      });
      
      expect(onStateUpdateSpy).toHaveBeenCalledWith(newState);
    });
  });

  describe('Role-Specific Features', () => {
    it('should handle speaker audio prioritization', async () => {
      await webrtcService.initialize();
      
      webrtcService.setActiveRole('speaker');
      
      expect(webrtcService.audioSettings.speakerPriority).toBe(true);
      expect(webrtcService.audioSettings.gainLevel).toBeGreaterThan(1);
    });

    it('should optimize listener audio processing', async () => {
      await webrtcService.initialize();
      
      webrtcService.setActiveRole('listener');
      
      expect(webrtcService.audioSettings.enhancedListening).toBe(true);
      expect(webrtcService.audioSettings.noiseReduction).toBe(true);
    });

    it('should provide scribe with optimal video layout', async () => {
      await webrtcService.initialize();
      
      webrtcService.setActiveRole('scribe');
      
      expect(webrtcService.videoSettings.layout).toBe('grid');
      expect(webrtcService.videoSettings.showAllParticipants).toBe(true);
    });
  });

  describe('Connection Quality Management', () => {
    it('should monitor connection quality', async () => {
      await webrtcService.initialize();
      await webrtcService.connectToParticipant('user1');
      
      // Simulate connection quality monitoring
      const qualityCallback = vi.fn();
      webrtcService.onConnectionQualityChange(qualityCallback);
      
      // Simulate quality change
      webrtcService.updateConnectionQuality('user1', 'poor');
      
      expect(qualityCallback).toHaveBeenCalledWith({
        participant: 'user1',
        quality: 'poor',
        recommendations: ['reduce video quality', 'check network']
      });
    });

    it('should automatically adjust quality based on network conditions', async () => {
      await webrtcService.initialize();
      await webrtcService.connectToParticipant('user1');
      
      // Simulate poor network conditions
      webrtcService.handleNetworkConditionChange('poor');
      
      expect(webrtcService.videoSettings.quality).toBe('low');
      expect(webrtcService.audioSettings.bitrate).toBeLessThan(64000);
    });
  });

  describe('Audio Management for Silent Pauses', () => {
    it('should detect silence periods', async () => {
      await webrtcService.initialize();
      
      const silenceCallback = vi.fn();
      webrtcService.onSilenceDetected(silenceCallback);
      
      // Simulate silence detection
      webrtcService.startSilenceDetection();
      
      // Mock audio level below threshold for extended period
      webrtcService.updateAudioLevel(0.01); // Very quiet
      
      // Advance time to trigger silence detection
      vi.advanceTimersByTime(5000); // 5 seconds
      
      expect(silenceCallback).toHaveBeenCalledWith({
        duration: 5000,
        participant: 'current-user'
      });
    });

    it('should provide comfort indicators during silence', async () => {
      await webrtcService.initialize();
      
      const comfortCallback = vi.fn();
      webrtcService.onComfortIndicatorNeeded(comfortCallback);
      
      // Simulate extended silence
      webrtcService.handleSilencePeriod(10000); // 10 seconds
      
      expect(comfortCallback).toHaveBeenCalledWith({
        type: 'gentle-reminder',
        message: 'Take your time to think'
      });
    });
  });

  describe('Session Recording (Optional)', () => {
    it('should start recording when requested', async () => {
      await webrtcService.initialize();
      
      const recordingResult = await webrtcService.startRecording({
        video: true,
        audio: true,
        participants: 'all'
      });
      
      expect(recordingResult.success).toBe(true);
      expect(webrtcService.isRecording).toBe(true);
    });

    it('should stop recording and provide download', async () => {
      await webrtcService.initialize();
      await webrtcService.startRecording();
      
      const recordingData = await webrtcService.stopRecording();
      
      expect(recordingData.blob).toBeDefined();
      expect(recordingData.duration).toBeGreaterThan(0);
      expect(webrtcService.isRecording).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle peer connection failures', async () => {
      mockRTCPeerConnection.mockImplementationOnce(() => {
        throw new Error('Connection failed');
      });
      
      await webrtcService.initialize();
      
      const result = await webrtcService.connectToParticipant('user1');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Connection failed');
    });

    it('should handle media device access failures', async () => {
      mockGetUserMedia.mockRejectedValueOnce(new Error('Camera not available'));
      
      const result = await webrtcService.initialize();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Camera not available');
    });

    it('should provide fallback options for connection issues', async () => {
      await webrtcService.initialize();
      
      // Simulate connection failure
      webrtcService.handleConnectionFailure('user1', 'ice-connection-failed');
      
      expect(webrtcService.fallbackOptions).toContain('audio-only');
      expect(webrtcService.fallbackOptions).toContain('retry-connection');
    });
  });

  describe('Cleanup', () => {
    it('should properly cleanup resources on disconnect', async () => {
      await webrtcService.initialize();
      await webrtcService.connectToParticipant('user1');
      
      webrtcService.cleanup();
      
      expect(webrtcService.participants).toEqual([]);
      expect(webrtcService.isConnected).toBe(false);
    });

    it('should stop media tracks on cleanup', async () => {
      await webrtcService.initialize();
      
      const stopSpy = vi.fn();
      webrtcService.localStream = {
        getTracks: () => [{ stop: stopSpy }, { stop: stopSpy }]
      };
      
      webrtcService.cleanup();
      
      expect(stopSpy).toHaveBeenCalledTimes(2);
    });
  });
});