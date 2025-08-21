import React, { useState, useMemo } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useVideoCall } from '../hooks/useVideoCall';
import { Participant } from '../types/groupSession';

interface VideoLobbyProps {
  sessionId: string;
  groupId: string;
  currentUserId: string;
  currentUserName: string;
  participants: Participant[];
  isHost: boolean;
  onStartSession: () => void;
  onLeaveSession: () => void;
}

const VIDEOS_PER_PAGE = 9; // 3x3 grid

export const VideoLobby: React.FC<VideoLobbyProps> = ({
  sessionId,
  groupId,
  currentUserId,
  currentUserName,
  participants,
  isHost,
  onStartSession,
  onLeaveSession
}) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);

  // Video call setup for lobby
  const videoCall = useVideoCall({
    sessionId: `${sessionId}-${groupId}-lobby`,
    currentUserId,
    currentUserName,
    isActive: true, // Always active in lobby
    participants
  });

  // Calculate pagination
  const totalPages = Math.ceil(participants.length / VIDEOS_PER_PAGE);
  const startIndex = currentPage * VIDEOS_PER_PAGE;
  const endIndex = startIndex + VIDEOS_PER_PAGE;
  const currentPageParticipants = participants.slice(startIndex, endIndex);

  // Check if all participants are ready
  const allParticipantsReady = useMemo(() => {
    return participants.every(p => p.status === 'ready');
  }, [participants]);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  const getParticipantDisplayName = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    return participant?.name || 'Unknown';
  };

  const getParticipantRole = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    return participant?.role || 'participant';
  };

  return (
    <div className="w-full">

      {/* Main Content */}
      <div className="w-full">
        {/* Status Information */}
        <div className="mb-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {t('dialectic.lobby.videoLobby.technicalCheck')}
              </span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {t('dialectic.lobby.videoLobby.technicalCheckDescription')}
            </p>
          </div>
        </div>

        {/* Video Grid */}
        <div className="mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2">
            {/* Local Video */}
                          <div className="relative bg-secondary-900 rounded-lg overflow-hidden aspect-[4/3]">
              <video
                ref={videoCall.localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                {currentUserName} (You)
              </div>
              {!videoCall.isVideoEnabled && (
                <div className="absolute inset-0 bg-secondary-800 flex items-center justify-center">
                  <div className="text-center text-secondary-400">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <div className="text-sm font-medium">Camera Off</div>
                  </div>
                </div>
              )}
            </div>

            {/* Peer Videos */}
            {Array.from(videoCall.peerStreams.keys()).map((peerId) => {
              const stream = videoCall.peerStreams.get(peerId);
              if (!stream) return null;

              return (
                <div key={peerId} className="relative bg-secondary-900 rounded-lg overflow-hidden aspect-[4/3]">
                  <video
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    ref={(el) => {
                      if (el) el.srcObject = stream;
                    }}
                  />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {getParticipantDisplayName(peerId)}
                  </div>
                </div>
              );
            })}

            {/* Placeholder for participants without video */}
            {currentPageParticipants
              .filter(p => p.id !== currentUserId && !videoCall.peerStreams.has(p.id))
              .map((participant) => (
                <div key={participant.id} className="relative bg-secondary-200 dark:bg-secondary-700 rounded-lg overflow-hidden aspect-[4/3] flex items-center justify-center">
                  <div className="text-center text-secondary-600 dark:text-secondary-400">
                    <div className="w-12 h-12 bg-secondary-300 dark:bg-secondary-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg font-semibold">
                        {participant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm font-medium">{participant.name}</div>
                    <div className="text-xs mt-1">
                      {participant.status === 'connecting' ? 'Connecting...' : 'No video'}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mb-3">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 0
                  ? 'bg-secondary-200 text-secondary-400 cursor-not-allowed'
                  : 'bg-secondary-200 text-secondary-700 hover:bg-secondary-300'
              }`}
            >
              {t('shared.actions.previous')}
            </button>
            
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-6 h-6 rounded text-xs font-medium transition-colors ${
                    currentPage === i
                      ? 'bg-accent-500 text-white'
                      : 'bg-secondary-200 text-secondary-700 hover:bg-secondary-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === totalPages - 1
                  ? 'bg-secondary-200 text-secondary-400 cursor-not-allowed'
                  : 'bg-secondary-200 text-secondary-700 hover:bg-secondary-300'
              }`}
            >
              {t('shared.actions.next')}
            </button>
          </div>
        )}

        {/* Video Controls */}
        <div className="flex justify-center space-x-2">
          <button
            onClick={videoCall.toggleMute}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              videoCall.isMuted
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-secondary-200 text-secondary-700 hover:bg-secondary-300'
            }`}
          >
            {videoCall.isMuted ? t('shared.actions.unmute') : t('shared.actions.mute')}
          </button>
          
          <button
            onClick={videoCall.toggleVideo}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !videoCall.isVideoEnabled
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-secondary-200 text-secondary-700 hover:bg-secondary-300'
            }`}
          >
            {videoCall.isVideoEnabled ? t('shared.actions.stopVideo') : t('shared.actions.startVideo')}
          </button>
        </div>

        {/* Connection Status */}
        <div className="mt-3 text-center">
          <div className="inline-flex items-center space-x-2 bg-secondary-100 dark:bg-secondary-800 rounded-lg px-4 py-2">
            <div className={`w-2 h-2 rounded-full ${
              videoCall.connectionState === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-sm text-secondary-700 dark:text-secondary-300">
              {videoCall.connectionState === 'connected' 
                ? t('dialectic.lobby.videoLobby.connected')
                : t('dialectic.lobby.videoLobby.connecting')
              }
            </span>
          </div>
        </div>

        {/* Error Display */}
        {videoCall.error && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              {t('dialectic.lobby.videoLobby.connectionError')}: {videoCall.error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
