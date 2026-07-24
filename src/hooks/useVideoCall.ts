import { useState, useEffect, useCallback, useRef } from 'react';
import { createVideoProvider } from '../services/video/createVideoProvider';
import type { VideoProvider } from '../services/video/types';

interface UseVideoCallProps {
  sessionId: string;
  currentUserId: string;
  currentUserName: string;
  participants: Array<{
    id: string;
    name: string;
    role: string;
    status: 'ready' | 'not-ready' | 'connecting';
  }>;
  isActive?: boolean;
  /** When false, skip all WebRTC init (e.g. test harness without Firebase). */
  enabled?: boolean;
  /** Firestore session doc id for signalling ACL (defaults to sessionId). */
  baseSessionId?: string;
}

interface VideoCallState {
  isConnected: boolean;
  isConnecting: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  error: string | null;
  peerStreams: Map<string, MediaStream>;
  connectionState: 'connected' | 'connecting' | 'disconnected';
}

export const useVideoCall = ({
  sessionId,
  currentUserId,
  participants,
  isActive = true,
  enabled = true,
  baseSessionId
}: UseVideoCallProps) => {
  const [state, setState] = useState<VideoCallState>({
    isConnected: false,
    isConnecting: false,
    isMuted: false,
    isVideoEnabled: true,
    error: null,
    peerStreams: new Map(),
    connectionState: 'disconnected'
  });

  const webrtcService = useRef<VideoProvider | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const isInitialized = useRef(false);
  const isJoining = useRef(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  const recoveryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const healthCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const participantsRef = useRef(participants);
  participantsRef.current = participants;

  // Handle disconnection with auto-recovery
  const handleDisconnection = useCallback(() => {
    if (!enabled) return;

    if (retryCountRef.current < maxRetries) {
      retryCountRef.current++;
      console.log(`Attempting to recover connection (attempt ${retryCountRef.current}/${maxRetries})`);
      
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
      }
      
      recoveryTimeoutRef.current = setTimeout(() => {
        if (webrtcService.current && isActive) {
          webrtcService.current.joinSession(participantsRef.current).catch(error => {
            console.error('Recovery attempt failed:', error);
          });
        }
      }, 2000 * retryCountRef.current);
    } else {
      console.error('Max retry attempts reached, connection recovery failed');
      setState(prev => ({
        ...prev,
        error: 'Connection lost and recovery failed. Please try Reconnect or refresh the page.'
      }));
    }
  }, [enabled, isActive]);

  // Initialize WebRTC service
  const initializeWebRTC = useCallback(async () => {
    if (!enabled) {
      return;
    }

    try {
      if (isInitialized.current) {
        console.log('WebRTC already initialized, skipping re-initialization');
        return;
      }

      console.log('Initializing video provider for session:', sessionId);

      webrtcService.current = createVideoProvider();
      
      await webrtcService.current.initialize(sessionId, currentUserId, {
        onParticipantJoined: (participantId: string) => {
          console.log('Participant joined:', participantId);
        },
        onParticipantLeft: (participantId: string) => {
          console.log('Participant left:', participantId);
          setState(prev => {
            const newPeerStreams = new Map(prev.peerStreams);
            const hadStream = newPeerStreams.has(participantId);
            newPeerStreams.delete(participantId);
            console.log('🟡 VIDEO - Removed peer stream for:', participantId, 'had stream:', hadStream);
            return { ...prev, peerStreams: newPeerStreams };
          });
        },
        onConnectionStateChange: (connectionState: 'connected' | 'connecting' | 'disconnected') => {
          setState(prev => ({
            ...prev,
            connectionState,
            isConnected: connectionState === 'connected',
            isConnecting: connectionState === 'connecting'
          }));
          
          if (connectionState === 'connected') {
            retryCountRef.current = 0;
          }
          
          if (connectionState === 'disconnected' && isActive) {
            handleDisconnection();
          }
        },
        onStreamReceived: (participantId: string, stream: MediaStream) => {
          console.log('🟢 VIDEO - Stream received for participant:', participantId, 'stream active:', stream.active, 'tracks:', stream.getTracks().length);
          setState(prev => {
            const newPeerStreams = new Map(prev.peerStreams);
            newPeerStreams.set(participantId, stream);
            console.log('🟢 VIDEO - Added peer stream for:', participantId, 'total streams:', newPeerStreams.size);
            return { ...prev, peerStreams: newPeerStreams };
          });
        }
      }, { baseSessionId: baseSessionId || sessionId });

      // Mark initialized only after successful setup so failures can retry
      isInitialized.current = true;

      if (isActive) {
        const localStream = await webrtcService.current.initializeLocalStream(
          state.isVideoEnabled,
          !state.isMuted
        );
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
        localStreamRef.current = localStream;

        await webrtcService.current.joinSession(participantsRef.current);
      }
    } catch (error) {
      console.error('Failed to initialize WebRTC:', error);
      isInitialized.current = false;
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initialize video call'
      }));
    }
  }, [sessionId, currentUserId, isActive, enabled, baseSessionId, state.isVideoEnabled, state.isMuted, handleDisconnection]);

  // Initialize when component mounts or dependencies change
  useEffect(() => {
    if (enabled && sessionId && currentUserId) {
      initializeWebRTC();
    }
  }, [sessionId, currentUserId, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle participant updates without re-initializing WebRTC
  useEffect(() => {
    if (!enabled) return;

    if (isInitialized.current && webrtcService.current && isActive && participants.length > 0) {
      console.log('Updating participants list without re-initializing WebRTC:', participants.length, 'participants');
      
      webrtcService.current.updateParticipants(participants).catch(error => {
        console.error('Failed to update participants:', error);
      });
    }
  }, [participants, isActive, enabled]);

  // Handle isActive state changes
  useEffect(() => {
    if (!enabled) return;

    if (sessionId && currentUserId && isActive && webrtcService.current && !isJoining.current) {
      const hasLocalStream = localVideoRef.current && localVideoRef.current.srcObject;
      const hasStoredStream = localStreamRef.current;
      
      if (isInitialized.current) {
        if (!hasLocalStream && hasStoredStream) {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = hasStoredStream;
          }
        } else if (!hasLocalStream && !hasStoredStream) {
          isJoining.current = true;
          
          webrtcService.current.initializeLocalStream(
            state.isVideoEnabled,
            !state.isMuted
          ).then(localStream => {
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = localStream;
            }
            localStreamRef.current = localStream;
            isJoining.current = false;
          }).catch(error => {
            console.error('Failed to initialize local stream:', error);
            isJoining.current = false;
          });
        }
      } else {
        initializeWebRTC();
      }
    }
  }, [isActive, sessionId, currentUserId, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Ensure local stream is always set to video element when ref changes
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current && !localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  });

  // Health check for video stream
  useEffect(() => {
    if (!enabled || !isActive || !isInitialized.current) {
      return;
    }

    healthCheckIntervalRef.current = setInterval(() => {
      const hasLocalStream = localVideoRef.current && localVideoRef.current.srcObject;
      const hasStoredStream = localStreamRef.current;
      
      if (!hasLocalStream && hasStoredStream && localVideoRef.current) {
        console.log('Health check: Restoring lost video stream');
        localVideoRef.current.srcObject = hasStoredStream;
      }
      
      if (!hasLocalStream && !hasStoredStream && !isJoining.current) {
        console.log('Health check: No video stream found, attempting recovery');
        if (webrtcService.current) {
          webrtcService.current.initializeLocalStream(
            state.isVideoEnabled,
            !state.isMuted
          ).then(localStream => {
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = localStream;
            }
            localStreamRef.current = localStream;
          }).catch(error => {
            console.error('Health check recovery failed:', error);
          });
        }
      }

      state.peerStreams.forEach((stream, participantId) => {
        if (!stream.active || stream.getTracks().length === 0) {
          console.warn('Health check: Invalid peer stream detected for:', participantId);
          setState(prev => {
            const newPeerStreams = new Map(prev.peerStreams);
            newPeerStreams.delete(participantId);
            return { ...prev, peerStreams: newPeerStreams };
          });
        }
      });
    }, 5000);
    
    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
        healthCheckIntervalRef.current = null;
      }
    };
  }, [enabled, isActive, state.isVideoEnabled, state.isMuted, state.peerStreams]);

  // Full teardown on unmount
  useEffect(() => {
    return () => {
      if (webrtcService.current) {
        console.log('Component unmounting, disconnecting WebRTC');
        webrtcService.current.disconnect();
        webrtcService.current = null;
        isInitialized.current = false;
      }
      
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
        recoveryTimeoutRef.current = null;
      }
      
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
        healthCheckIntervalRef.current = null;
      }
      
      localStreamRef.current = null;
    };
  }, []);

  const toggleMute = useCallback(() => {
    if (webrtcService.current) {
      const newMutedState = !state.isMuted;
      webrtcService.current.toggleAudio(!newMutedState);
      setState(prev => ({ ...prev, isMuted: newMutedState }));
    }
  }, [state.isMuted]);

  const toggleVideo = useCallback(() => {
    if (webrtcService.current) {
      const newVideoState = !state.isVideoEnabled;
      webrtcService.current.toggleVideo(newVideoState);
      setState(prev => ({ ...prev, isVideoEnabled: newVideoState }));
    }
  }, [state.isVideoEnabled]);

  const leaveCall = useCallback(async () => {
    if (webrtcService.current) {
      await webrtcService.current.leaveSession();
      localStreamRef.current = null;
      isInitialized.current = false;
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        connectionState: 'disconnected',
        peerStreams: new Map()
      }));
    }
  }, []);

  // Full reconnect: tear down signalling + peers, then re-init
  const reconnectCall = useCallback(async () => {
    if (!enabled) return;

    console.log('Reconnecting WebRTC call');
    retryCountRef.current = 0;

    if (recoveryTimeoutRef.current) {
      clearTimeout(recoveryTimeoutRef.current);
      recoveryTimeoutRef.current = null;
    }

    setState(prev => ({
      ...prev,
      error: null,
      isConnected: false,
      isConnecting: true,
      connectionState: 'connecting',
      peerStreams: new Map()
    }));

    try {
      if (webrtcService.current) {
        await webrtcService.current.disconnect();
        webrtcService.current = null;
      }
      localStreamRef.current = null;
      isInitialized.current = false;
      await initializeWebRTC();
    } catch (error) {
      console.error('Reconnect failed:', error);
      isInitialized.current = false;
      setState(prev => ({
        ...prev,
        isConnecting: false,
        connectionState: 'disconnected',
        error: error instanceof Error ? error.message : 'Failed to reconnect'
      }));
    }
  }, [enabled, initializeWebRTC]);

  const getParticipantDisplayName = useCallback((participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    return participant?.name || 'Unknown';
  }, [participants]);

  const getParticipantRole = useCallback((participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    return participant?.role || 'unknown';
  }, [participants]);

  const updateParticipants = useCallback((newParticipants: Array<{ id: string; name: string; role: string; status: 'ready' | 'not-ready' | 'connecting' }>) => {
    if (webrtcService.current && isInitialized.current) {
      webrtcService.current.updateParticipants(newParticipants).catch(error => {
        console.error('Failed to update participants:', error);
      });
    }
  }, []);

  return {
    // State
    ...state,
    localVideoRef,
    localStreamRef,
    
    // Actions
    toggleMute,
    toggleVideo,
    leaveCall,
    reconnectCall,
    updateParticipants,
    getParticipantDisplayName,
    getParticipantRole,
    
    // Computed values
    peerCount: state.peerStreams.size,
    hasError: !!state.error,
    canConnect: enabled && isActive && !!sessionId && !!currentUserId
  };
};
