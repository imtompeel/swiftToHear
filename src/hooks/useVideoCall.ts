import { useState, useEffect, useCallback, useRef } from 'react';
import { WebRTCService } from '../services/webrtcService';

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
  isActive = true
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

  const webrtcService = useRef<WebRTCService | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const isInitialized = useRef(false);
  const isJoining = useRef(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  const recoveryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Initialize WebRTC service
  const initializeWebRTC = useCallback(async () => {
    try {
      // Don't re-initialize if already initialized
      if (isInitialized.current) {
        console.log('WebRTC already initialized, skipping re-initialization');
        return;
      }

      console.log('Initializing WebRTC service for session:', sessionId);
      isInitialized.current = true;

      webrtcService.current = WebRTCService.getInstance();
      
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
          
          // Reset retry count on successful connection
          if (connectionState === 'connected') {
            retryCountRef.current = 0;
          }
          
          // Handle disconnection with auto-recovery
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
      });

      // Initialize local stream
      if (isActive) {
        const localStream = await webrtcService.current.initializeLocalStream(
          state.isVideoEnabled,
          !state.isMuted
        );
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
          localStreamRef.current = localStream;
        }

        // Join session with current participants
        await webrtcService.current.joinSession(participants);
      }
    } catch (error) {
      console.error('Failed to initialize WebRTC:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initialize video call'
      }));
    }
  }, [sessionId, currentUserId, isActive, state.isVideoEnabled, state.isMuted]); // Removed participants dependency

  // Handle disconnection with auto-recovery
  const handleDisconnection = useCallback(() => {
    if (retryCountRef.current < maxRetries) {
      retryCountRef.current++;
      console.log(`Attempting to recover connection (attempt ${retryCountRef.current}/${maxRetries})`);
      
      // Clear any existing recovery timeout
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
      }
      
      // Retry after a delay
      recoveryTimeoutRef.current = setTimeout(() => {
        if (webrtcService.current && isActive) {
          webrtcService.current.joinSession(participants).catch(error => {
            console.error('Recovery attempt failed:', error);
          });
        }
      }, 2000 * retryCountRef.current); // Exponential backoff
    } else {
      console.error('Max retry attempts reached, connection recovery failed');
      setState(prev => ({
        ...prev,
        error: 'Connection lost and recovery failed. Please refresh the page.'
      }));
    }
  }, [isActive, participants]);

  // Initialize when component mounts or dependencies change
  useEffect(() => {
    if (sessionId && currentUserId) {
      initializeWebRTC();
    }
  }, [sessionId, currentUserId]); // Removed isActive and initializeWebRTC from dependencies

  // Handle participant updates without re-initializing WebRTC
  useEffect(() => {
    if (isInitialized.current && webrtcService.current && isActive && participants.length > 0) {
      // Only update participants if we're already connected and have participants
      // This prevents disrupting existing video connections when roles are updated
      console.log('Updating participants list without re-initializing WebRTC:', participants.length, 'participants');
      
      // Use the new updateParticipants method that preserves existing connections
      webrtcService.current.updateParticipants(participants).catch(error => {
        console.error('Failed to update participants:', error);
      });
    }
  }, [participants, isActive]); // Only depend on participants and isActive

  // Handle isActive state changes
  useEffect(() => {
    if (sessionId && currentUserId && isActive && webrtcService.current && !isJoining.current) {
      // Check if we need to initialize local stream
      const hasLocalStream = localVideoRef.current && localVideoRef.current.srcObject;
      const hasStoredStream = localStreamRef.current;
      
      if (isInitialized.current) {
        // If we don't have a local stream but have a stored stream, restore it
        if (!hasLocalStream && hasStoredStream) {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = hasStoredStream;
          }
        }
        // If we don't have any stream, initialize it
        else if (!hasLocalStream && !hasStoredStream) {
          isJoining.current = true;
          
          webrtcService.current.initializeLocalStream(
            state.isVideoEnabled,
            !state.isMuted
          ).then(localStream => {
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = localStream;
              localStreamRef.current = localStream;
            }
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
  }, [isActive, sessionId, currentUserId]); // Removed participants from dependencies

  // Ensure local stream is always set to video element when ref changes
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current && !localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [localVideoRef.current]);

  // Health check for video stream
  useEffect(() => {
    if (isActive && isInitialized.current) {
      healthCheckIntervalRef.current = setInterval(() => {
        const hasLocalStream = localVideoRef.current && localVideoRef.current.srcObject;
        const hasStoredStream = localStreamRef.current;
        
        // If video element lost its stream but we have a stored one, restore it
        if (!hasLocalStream && hasStoredStream && localVideoRef.current) {
          console.log('Health check: Restoring lost video stream');
          localVideoRef.current.srcObject = hasStoredStream;
        }
        
        // If we have no stream at all and should be active, try to recover
        if (!hasLocalStream && !hasStoredStream && !isJoining.current) {
          console.log('Health check: No video stream found, attempting recovery');
          if (webrtcService.current) {
            webrtcService.current.initializeLocalStream(
              state.isVideoEnabled,
              !state.isMuted
            ).then(localStream => {
              if (localVideoRef.current) {
                localVideoRef.current.srcObject = localStream;
                localStreamRef.current = localStream;
              }
            }).catch(error => {
              console.error('Health check recovery failed:', error);
            });
          }
        }

        // Check peer stream health
        state.peerStreams.forEach((stream, participantId) => {
          if (!stream.active || stream.getTracks().length === 0) {
            console.warn('Health check: Invalid peer stream detected for:', participantId, 'active:', stream.active, 'tracks:', stream.getTracks().length);
            // Remove invalid stream
            setState(prev => {
              const newPeerStreams = new Map(prev.peerStreams);
              newPeerStreams.delete(participantId);
              console.log('🟡 VIDEO - Health check removed invalid stream for:', participantId);
              return { ...prev, peerStreams: newPeerStreams };
            });
          }
        });
      }, 5000); // Check every 5 seconds
      
      return () => {
        if (healthCheckIntervalRef.current) {
          clearInterval(healthCheckIntervalRef.current);
          healthCheckIntervalRef.current = null;
        }
      };
    }
  }, [isActive, state.isVideoEnabled, state.isMuted, state.peerStreams]);

  // Separate cleanup effect that only runs on unmount
  useEffect(() => {
    return () => {
      // Cleanup on unmount - only disconnect if we're actually leaving the session
      if (webrtcService.current) {
        console.log('Component unmounting, cleaning up WebRTC');
        webrtcService.current.leaveSession();
        isInitialized.current = false;
      }
      
      // Clear all timeouts and intervals
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
        recoveryTimeoutRef.current = null;
      }
      
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
        healthCheckIntervalRef.current = null;
      }
      
      // Stop local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
    };
  }, []); // Empty dependency array means this only runs on mount/unmount

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (webrtcService.current) {
      const newMutedState = !state.isMuted;
      webrtcService.current.toggleAudio(!newMutedState);
      setState(prev => ({ ...prev, isMuted: newMutedState }));
    }
  }, [state.isMuted]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (webrtcService.current) {
      const newVideoState = !state.isVideoEnabled;
      webrtcService.current.toggleVideo(newVideoState);
      setState(prev => ({ ...prev, isVideoEnabled: newVideoState }));
    }
  }, [state.isVideoEnabled]);

  // Leave call
  const leaveCall = useCallback(async () => {
    if (webrtcService.current) {
      await webrtcService.current.leaveSession();
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        connectionState: 'disconnected',
        peerStreams: new Map()
      }));
    }
  }, []);

  // Get participant display name
  const getParticipantDisplayName = useCallback((participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    return participant?.name || 'Unknown';
  }, [participants]);

  // Get participant role
  const getParticipantRole = useCallback((participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    return participant?.role || 'unknown';
  }, [participants]);

  // Update participants without disrupting connections
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
    updateParticipants,
    getParticipantDisplayName,
    getParticipantRole,
    
    // Computed values
    peerCount: state.peerStreams.size,
    hasError: !!state.error,
    canConnect: isActive && !!sessionId && !!currentUserId
  };
}; 