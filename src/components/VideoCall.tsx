import React, { useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useVideoCall } from '../hooks/useVideoCall';

// Peer Video Component
interface PeerVideoProps {
  peerId: string;
  stream: MediaStream;
  displayName: string;
  role: string;
}

const PeerVideo: React.FC<PeerVideoProps> = ({ peerId, stream, displayName, role }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      console.log('🟢 VIDEO - Set stream for peer:', peerId, 'stream:', stream);
    }
  }, [stream, peerId]);

  return (
    <div className="relative bg-secondary-900 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-48 object-cover"
      />
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
        {displayName} - {role}
      </div>
    </div>
  );
};

interface VideoCallProps {
  sessionId: string;
  currentUserId: string;
  currentUserName: string;
  participants: Array<{
    id: string;
    name: string;
    role: string;
    status: 'ready' | 'not-ready' | 'connecting';
  }>;
  onParticipantJoined?: (participantId: string) => void;
  onParticipantLeft?: (participantId: string) => void;
  onConnectionStateChange?: (state: 'connected' | 'connecting' | 'disconnected') => void;
  isActive?: boolean;
  className?: string;
}

export const VideoCall: React.FC<VideoCallProps> = ({
  sessionId,
  currentUserId,
  currentUserName,
  participants,
  isActive = true,
  className = ''
}) => {
  useTranslation();
  
  // Use the video call hook
  const {
    isMuted,
    isVideoEnabled,
    error,
    peerStreams,
    connectionState,
    localVideoRef,
    toggleMute,
    toggleVideo,
    getParticipantDisplayName,
    getParticipantRole,
  } = useVideoCall({
    sessionId,
    currentUserId,
    currentUserName,
    participants,
    isActive
  });

  return (
    <div className={`video-call-container ${className}`}>
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Local Video */}
        <div className="relative bg-secondary-900 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-48 object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            {currentUserName} (You) - {getParticipantRole(currentUserId)}
          </div>
        </div>

        {/* Peer Videos */}
        {Array.from(peerStreams.keys()).map((peerId) => (
          <PeerVideo
            key={peerId}
            peerId={peerId}
            stream={peerStreams.get(peerId)!}
            displayName={getParticipantDisplayName(peerId)}
            role={getParticipantRole(peerId)}
          />
        ))}
      </div>

      {/* Video Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={toggleMute}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isMuted 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-secondary-200 text-secondary-700 hover:bg-secondary-300'
          }`}
        >
          {isMuted ? '🔇' : '🔊'} {isMuted ? 'Unmute' : 'Mute'}
        </button>

        <button
          onClick={toggleVideo}
          className={`px-4 py-2 rounded-lg transition-colors ${
            !isVideoEnabled 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-secondary-200 text-secondary-700 hover:bg-secondary-300'
          }`}
        >
          {isVideoEnabled ? '📹' : '🚫'} {isVideoEnabled ? 'Stop Video' : 'Start Video'}
        </button>
      </div>

      {/* Connection Status */}
      <div className="text-center mt-4">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
          connectionState === 'connected' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : connectionState === 'connecting'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            connectionState === 'connected' ? 'bg-green-500' :
            connectionState === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          {connectionState === 'connected' ? 'Connected' :
           connectionState === 'connecting' ? 'Connecting...' : 'Disconnected'}
        </div>
      </div>
    </div>
  );
}; 