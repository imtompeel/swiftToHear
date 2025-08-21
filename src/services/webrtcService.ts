import { FirebaseSignalingService, SignalingMessage } from './firebaseSignalingService';

export interface WebRTCMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join' | 'leave';
  from: string;
  to?: string;
  data: any;
  sessionId: string;
  timestamp: number;
}

export interface PeerConnection {
  peerId: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

export class WebRTCService {
  private static instance: WebRTCService;
  private peerConnections: Map<string, PeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private signalingService: FirebaseSignalingService | null = null;
  private sessionId: string | null = null;
  private currentUserId: string | null = null;
  private qualityMonitoringIntervals: Map<string, NodeJS.Timeout> = new Map();

  // WebRTC configuration
  private rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ],
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle' as RTCBundlePolicy,
    rtcpMuxPolicy: 'require' as RTCRtcpMuxPolicy
  };

  // Audio constraints with echo cancellation
  private audioConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
    channelCount: 1
  };

  // Video constraints with bandwidth optimization
  private videoConstraints = {
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 },
    frameRate: { ideal: 30, max: 30 }
  };

  // Event callbacks
  private onParticipantJoined?: (participantId: string) => void;
  private onParticipantLeft?: (participantId: string) => void;
  private onConnectionStateChange?: (state: 'connected' | 'connecting' | 'disconnected') => void;
  private onStreamReceived?: (participantId: string, stream: MediaStream) => void;

  static getInstance(): WebRTCService {
    if (!WebRTCService.instance) {
      WebRTCService.instance = new WebRTCService();
    }
    return WebRTCService.instance;
  }

  // Initialize the WebRTC service
  async initialize(
    sessionId: string,
    currentUserId: string,
    callbacks: {
      onParticipantJoined?: (participantId: string) => void;
      onParticipantLeft?: (participantId: string) => void;
      onConnectionStateChange?: (state: 'connected' | 'connecting' | 'disconnected') => void;
      onStreamReceived?: (participantId: string, stream: MediaStream) => void;
    }
  ) {
    // Cleanup existing connections but keep signaling service
    await this.cleanup();
    
    this.sessionId = sessionId;
    this.currentUserId = currentUserId;
    this.onParticipantJoined = callbacks.onParticipantJoined;
    this.onParticipantLeft = callbacks.onParticipantLeft;
    this.onConnectionStateChange = callbacks.onConnectionStateChange;
    this.onStreamReceived = callbacks.onStreamReceived;

    // Initialize Firebase signaling service
    await this.initializeSignaling();
  }

  // Initialize local media stream
  async initializeLocalStream(videoEnabled: boolean = true, audioEnabled: boolean = true): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        video: videoEnabled ? this.videoConstraints : false,
        audio: audioEnabled ? this.audioConstraints : false
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Apply additional audio processing if available
      if (audioEnabled && this.localStream.getAudioTracks().length > 0) {
        const audioTrack = this.localStream.getAudioTracks()[0];
        
        // Set audio track properties for better echo cancellation
        if (audioTrack.getSettings) {
          const settings = audioTrack.getSettings();
          console.log('🟢 WEBRTC - Audio track settings:', settings);
        }
        
        // Enable echo cancellation if supported
        if (audioTrack.getCapabilities) {
          const capabilities = audioTrack.getCapabilities();
          console.log('🟢 WEBRTC - Audio track capabilities:', capabilities);
        }
      }

      this.onConnectionStateChange?.('connecting');
      return this.localStream;
    } catch (error) {
      console.error('Failed to get user media:', error);
      this.onConnectionStateChange?.('disconnected');
      throw error;
    }
  }

  // Join the session
  async joinSession(participants: Array<{ id: string; name: string }>) {
    if (!this.sessionId || !this.currentUserId) {
      throw new Error('WebRTC service not initialized');
    }

    // Wait a moment for signaling service to be fully initialized
    await new Promise(resolve => setTimeout(resolve, 200));

    // Send join message via Firebase signaling
    if (this.signalingService) {
      try {
        await this.signalingService.sendJoinMessage(participants);
        console.log('🟢 WEBRTC - Join message sent successfully');
      } catch (error) {
        console.warn('🟡 WEBRTC - Failed to send join message:', error);
      }
    } else {
      console.warn('🟡 WEBRTC - No signaling service available');
    }

    // Don't create peer connections here - let the signaling handle it
    // The handleParticipantJoined method will create connections when needed
  }

  // Update participants without disrupting existing connections
  async updateParticipants(participants: Array<{ id: string; name: string }>) {
    if (!this.sessionId || !this.currentUserId) {
      throw new Error('WebRTC service not initialized');
    }

    console.log('🟢 WEBRTC - Updating participants list:', participants.length, 'participants');
    
    // Only send a join message if we don't have existing connections
    // This prevents disrupting existing video connections
    if (this.peerConnections.size === 0) {
      await this.joinSession(participants);
    } else {
      console.log('🟢 WEBRTC - Skipping join message to preserve existing connections');
    }
  }

  // Create a peer connection for a specific participant
  async createPeerConnection(peerId: string): Promise<RTCPeerConnection> {
    if (this.peerConnections.has(peerId)) {
      const existingConnection = this.peerConnections.get(peerId)!.connection;
      // Check if existing connection is still valid
      if (existingConnection.signalingState !== 'closed') {
        return existingConnection;
      } else {
        // Remove closed connection
        this.peerConnections.delete(peerId);
      }
    }

    console.log('🟢 WEBRTC - Creating new peer connection for:', peerId);
    const peerConnection = new RTCPeerConnection(this.rtcConfig);
    
    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    // Handle incoming tracks with validation
    peerConnection.ontrack = (event) => {
      if (event.streams && event.streams.length > 0) {
        const stream = event.streams[0];
        
        // Validate stream before using it
        if (stream.active && stream.getTracks().length > 0) {
          console.log('🟢 WEBRTC - Valid stream received from:', peerId, 'tracks:', stream.getTracks().length);
          this.onStreamReceived?.(peerId, stream);
        } else {
          console.warn('🟡 WEBRTC - Invalid stream received from:', peerId);
        }
      }
    };

    // Handle ICE candidates with better error handling
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        if (this.signalingService) {
          this.signalingService.sendIceCandidate(peerId, event.candidate);
        }
      }
    };

    // Enhanced connection state monitoring
    peerConnection.onconnectionstatechange = () => {
      console.log('🟢 WEBRTC - Connection state changed for', peerId, ':', peerConnection.connectionState);
      
      switch (peerConnection.connectionState) {
        case 'connected':
          this.onConnectionStateChange?.('connected');
          this.onParticipantJoined?.(peerId);
          this.startConnectionQualityMonitoring(peerConnection, peerId);
          break;
        case 'connecting':
          this.onConnectionStateChange?.('connecting');
          break;
        case 'disconnected':
        case 'failed':
        case 'closed':
          this.onParticipantLeft?.(peerId);
          this.stopConnectionQualityMonitoring(peerId);
          break;
      }
    };

    // Monitor ICE connection state
    peerConnection.oniceconnectionstatechange = () => {
      console.log('🟢 WEBRTC - ICE connection state for', peerId, ':', peerConnection.iceConnectionState);
      
      if (peerConnection.iceConnectionState === 'failed') {
        console.warn('🟡 WEBRTC - ICE connection failed for:', peerId);
        // Attempt to restart ICE
        try {
          peerConnection.restartIce();
        } catch (error) {
          console.error('🔴 WEBRTC - Failed to restart ICE for:', peerId, error);
        }
      }
    };

    // Store the peer connection
    this.peerConnections.set(peerId, {
      peerId,
      connection: peerConnection
    });

    return peerConnection;
  }

  // Handle incoming signaling messages
  async handleSignalingMessage(message: SignalingMessage) {
    if (message.from === this.currentUserId) {
      return; // Ignore our own messages
    }

    switch (message.type) {
      case 'join':
        await this.handleParticipantJoined(message.from);
        break;
      case 'leave':
        await this.handleParticipantLeft(message.from);
        break;
      case 'offer':
        await this.handleOffer(message.from, message.data);
        break;
      case 'answer':
        await this.handleAnswer(message.from, message.data);
        break;
      case 'ice-candidate':
        await this.handleIceCandidate(message.from, message.data);
        break;
    }
  }

  // Handle participant joining
  private async handleParticipantJoined(participantId: string) {
    try {
      // Check if we already have a connection for this participant
      if (this.peerConnections.has(participantId)) {
        const existingConnection = this.peerConnections.get(participantId)!.connection;
        if (existingConnection.signalingState !== 'closed') {
          return;
        } else {
          // Remove closed connection
          this.peerConnections.delete(participantId);
        }
      }
      
      // Ensure we have a local stream before creating the connection
      if (!this.localStream) {
        return;
      }
      
      const peerConnection = await this.createPeerConnection(participantId);
      
      // Check if connection is still valid
      if (peerConnection.signalingState === 'closed') {
        return;
      }
      
      // Create and send offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      if (this.signalingService) {
        await this.signalingService.sendOffer(participantId, offer);
      }
    } catch (error) {
      console.error('🔴 WEBRTC - Error handling participant joined:', error);
    }
  }

  // Handle participant leaving
  private async handleParticipantLeft(participantId: string) {
    const peerConnection = this.peerConnections.get(participantId);
    if (peerConnection) {
      try {
        peerConnection.connection.close();
        this.peerConnections.delete(participantId);
        this.onParticipantLeft?.(participantId);
        console.log('🟢 WEBRTC - Closed peer connection for participant:', participantId);
      } catch (error) {
        console.error('🔴 WEBRTC - Error closing peer connection:', error);
      }
    }
  }

  // Handle incoming offer
  private async handleOffer(from: string, data: { offer: RTCSessionDescriptionInit }) {
    const peerConnection = await this.createPeerConnection(from);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
    
    // Create and send answer
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    if (this.signalingService) {
      await this.signalingService.sendAnswer(from, answer);
    }
  }

  // Handle incoming answer
  private async handleAnswer(from: string, data: { answer: RTCSessionDescriptionInit }) {
    const peerConnection = this.peerConnections.get(from);
    if (peerConnection) {
      await peerConnection.connection.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
  }

  // Handle incoming ICE candidate
  private async handleIceCandidate(from: string, data: { candidate: any }) {
    const peerConnection = this.peerConnections.get(from);
    if (peerConnection) {
      try {
        // Convert the plain object back to RTCIceCandidateInit
        const candidateInit: RTCIceCandidateInit = {
          candidate: data.candidate.candidate || '',
          sdpMLineIndex: data.candidate.sdpMLineIndex || 0,
          sdpMid: data.candidate.sdpMid || ''
        };
        
        await peerConnection.connection.addIceCandidate(new RTCIceCandidate(candidateInit));
        console.log('🟢 WEBRTC - Added ICE candidate for participant:', from);
      } catch (error) {
        console.error('🔴 WEBRTC - Error adding ICE candidate:', error);
      }
    }
  }

  // Initialize Firebase signaling service
  private async initializeSignaling() {
    if (!this.sessionId || !this.currentUserId) {
      throw new Error('WebRTC service not initialized');
    }

    console.log('🟢 WEBRTC - Initializing Firebase signaling for session:', this.sessionId);
    
    // Initialize Firebase signaling service
    this.signalingService = FirebaseSignalingService.getInstance();
    await this.signalingService.initialize(this.sessionId, this.currentUserId);
    
    // Wait a moment to ensure initialization is complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Register message handlers
    this.signalingService.onMessage('join', (message) => this.handleSignalingMessage(message));
    this.signalingService.onMessage('leave', (message) => this.handleSignalingMessage(message));
    this.signalingService.onMessage('offer', (message) => this.handleSignalingMessage(message));
    this.signalingService.onMessage('answer', (message) => this.handleSignalingMessage(message));
    this.signalingService.onMessage('ice-candidate', (message) => this.handleSignalingMessage(message));
    
    console.log('🟢 WEBRTC - Firebase signaling initialized successfully');
  }

  // Leave the session
  async leaveSession() {
    // Send leave message via Firebase signaling
    if (this.signalingService) {
      try {
        await this.signalingService.sendLeaveMessage();
      } catch (error) {
        console.warn('🟡 WEBRTC - Failed to send leave message:', error);
      }
    }

    // Close all peer connections
    this.peerConnections.forEach(({ connection }) => {
      connection.close();
    });
    this.peerConnections.clear();

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    this.onConnectionStateChange?.('disconnected');
  }

  // Disconnect the signaling service (call this when component unmounts)
  async disconnect() {
    // Send leave message first
    await this.leaveSession();
    
    // Then disconnect the signaling service
    if (this.signalingService) {
      await this.signalingService.disconnect();
      this.signalingService = null;
    }
  }

  // Cleanup without disconnecting signaling (for re-initialization)
  async cleanup() {
    // Close all peer connections
    this.peerConnections.forEach(({ connection }) => {
      connection.close();
    });
    this.peerConnections.clear();

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    this.onConnectionStateChange?.('disconnected');
  }


  // Get local stream
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  // Get peer connections
  getPeerConnections(): Map<string, PeerConnection> {
    return this.peerConnections;
  }

  // Toggle local audio
  toggleAudio(enabled: boolean) {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = enabled;
      }
    }
  }

  // Toggle local video
  toggleVideo(enabled: boolean) {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = enabled;
      }
    }
  }

  // Start monitoring connection quality for a peer
  private startConnectionQualityMonitoring(peerConnection: RTCPeerConnection, peerId: string) {
    // Clear any existing monitoring
    this.stopConnectionQualityMonitoring(peerId);
    
    const interval = setInterval(() => {
      try {
        // Get connection statistics
        peerConnection.getStats().then(stats => {
          stats.forEach(report => {
            if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
              const packetsLost = report.packetsLost || 0;
              const packetsReceived = report.packetsReceived || 0;
              const lossRate = packetsReceived > 0 ? packetsLost / packetsReceived : 0;
              
              if (lossRate > 0.1) { // More than 10% packet loss
                console.warn('🟡 WEBRTC - High packet loss detected for:', peerId, 'loss rate:', lossRate);
              }
            }
          });
        }).catch(error => {
          console.error('🔴 WEBRTC - Error getting connection stats for:', peerId, error);
        });
      } catch (error) {
        console.error('🔴 WEBRTC - Error in quality monitoring for:', peerId, error);
      }
    }, 5000); // Check every 5 seconds
    
    this.qualityMonitoringIntervals.set(peerId, interval);
  }

  // Stop monitoring connection quality for a peer
  private stopConnectionQualityMonitoring(peerId: string) {
    const interval = this.qualityMonitoringIntervals.get(peerId);
    if (interval) {
      clearInterval(interval);
      this.qualityMonitoringIntervals.delete(peerId);
    }
  }
} 