import React from 'react';
import { RaisedHandIndicator } from './guidance/RaisedHandIndicator';
import { ListenerInteractions } from './guidance/ListenerInteractions';
// MUI Icons
import { 
  Mic, 
  MicOff, 
  Videocam, 
  VideocamOff, 
  Visibility, 
  VisibilityOff,
  CameraAlt 
} from '@mui/icons-material';

interface SessionVideoProps {
  session: any;
  videoCall: any;
  showSelfVideo: boolean;
  onToggleSelfVideo: () => void;
  currentUserRole?: 'speaker' | 'listener' | 'scribe' | 'observer' | 'observer-temporary' | 'observer-permanent';
  currentUserId?: string;
  safetyTimeout?: any;
}

export const SessionVideo: React.FC<SessionVideoProps> = React.memo(({ 
  session, 
  videoCall, 
  showSelfVideo, 
  onToggleSelfVideo, 
  currentUserRole, 
  currentUserId, 
  safetyTimeout 
}) => {
  if (!session) return null;
  
  // Convert peer streams Map to array for rendering
  const peerStreams = Array.from(videoCall.peerStreams.entries()) as [string, MediaStream][];
  
  // Calculate total participants (local + peers)
  const totalParticipants = 1 + peerStreams.length;
  
  // Calculate visible participants based on self-video visibility
  const visibleParticipants = showSelfVideo ? totalParticipants : peerStreams.length;
  
  // Determine optimal grid layout based on visible participant count
  const getGridClasses = () => {
    if (visibleParticipants === 0) {
      return "grid grid-cols-1 gap-2 sm:gap-3 lg:gap-4"; // Fallback for edge case
    } else if (visibleParticipants === 1) {
      return "grid grid-cols-1 gap-2 sm:gap-3 lg:gap-4";
    } else if (visibleParticipants === 2) {
      return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 sm:gap-3 lg:gap-4";
    } else if (visibleParticipants === 3) {
      return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 lg:gap-4";
    } else if (visibleParticipants === 4) {
      return "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4";
    } else {
      return "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4";
    }
  };
  
  return (
    <div className="w-full max-w-full overflow-hidden">
      {videoCall.error ? (
        <div className="w-full aspect-video bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-center">
          <div className="text-center p-2 sm:p-4">
            <div className="text-red-600 dark:text-red-400 text-sm sm:text-lg font-semibold mb-2">
              Video Connection Error
            </div>
            <div className="text-red-500 dark:text-red-300 text-xs sm:text-sm mb-3">
              {videoCall.error}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 sm:px-4 sm:py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs sm:text-sm"
            >
              Retry Connection
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Restore self-video button when hidden - positioned above video grid */}
          {!showSelfVideo && (
            <div className="mb-3 flex justify-center">
              <button
                onClick={onToggleSelfVideo}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg shadow-lg transition-colors"
                title="Show your video to yourself"
              >
                <Visibility className="text-sm" />
                <span>Show Self Video</span>
              </button>
            </div>
          )}

          {/* Raised Hand Indicator - Show when any listener has raised their hand (only for speakers) */}
          <RaisedHandIndicator 
            participants={session?.participants || []} 
            className="mb-3"
            showForRole={currentUserRole}
          />

          {/* Listener Interactions - Show when current user is a listener (only on mobile) */}
          {currentUserRole === 'listener' && (
            <div className="mb-3 lg:hidden">
              <ListenerInteractions 
                sessionId={session?.sessionId || ''}
                currentUserId={currentUserId || ''}
                className="mb-3"
              />
            </div>
          )}

          {/* Adaptive Video Grid - Constrained to container */}
          <div className={`${getGridClasses()} max-w-full overflow-hidden`}>
            {/* Local Video - Only render in grid when visible to user */}
            {showSelfVideo && (
              <div className="relative min-w-0 min-h-0 aspect-video lg:aspect-[4/3]">
              {/* Video element always exists for stream continuity */}
              <video
                ref={videoCall.localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover rounded-lg bg-gray-200 dark:bg-gray-700 max-w-full ${showSelfVideo && videoCall.isVideoEnabled ? 'block' : 'hidden'}`}
              />
              
              {/* Overlay when video is hidden from self */}
              {!showSelfVideo && videoCall.isVideoEnabled && (
                <div className="absolute inset-0 w-full h-full bg-gray-600 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-300 dark:text-gray-400">
                    <div className="text-2xl mb-2">📹</div>
                    <div className="text-sm font-medium">Video Hidden</div>
                    <div className="text-xs mt-1">Others can still see you</div>
                  </div>
                </div>
              )}
              
              {/* Overlay when camera is turned off */}
              {!videoCall.isVideoEnabled && (
                <div className="absolute inset-0 w-full h-full bg-gray-800 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-300 dark:text-gray-400">
                    <CameraAlt className="text-4xl mb-2 mx-auto" />
                    <div className="text-sm font-medium">Camera Off</div>
                    <div className="text-xs mt-1">Your camera is disabled</div>
                  </div>
                </div>
              )}
              
              {/* Overlay during safety timeout */}
              {safetyTimeout?.isTimeoutActive && safetyTimeout?.requestedByMe && (
                <div className="absolute inset-0 w-full h-full bg-blue-900 bg-opacity-90 rounded-lg flex items-center justify-center">
                  <div className="text-center text-blue-100">
                    <svg className="w-12 h-12 mb-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div className="text-lg font-semibold mb-1">Safety Timeout</div>
                    <div className="text-sm">Your video is paused</div>
                    <div className="text-xs mt-2">Take care of yourself</div>
                  </div>
                </div>
              )}
              <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black bg-opacity-50 text-white text-xs px-1 sm:px-2 py-1 rounded z-10">
                You
              </div>
              
              {/* Audio/Video Controls */}
              <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 flex space-x-1 z-10">
                {/* Microphone Toggle */}
                <button
                  onClick={videoCall.toggleMute}
                  className={`p-1 sm:p-2 lg:p-3 rounded transition-all duration-200 flex items-center justify-center ${
                    videoCall.isMuted 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-black bg-opacity-50 hover:bg-opacity-70 text-white'
                  }`}
                  title={videoCall.isMuted ? "Unmute microphone" : "Mute microphone"}
                >
                  {videoCall.isMuted ? (
                    <MicOff className="text-sm sm:text-base lg:text-lg" />
                  ) : (
                    <Mic className="text-sm sm:text-base lg:text-lg" />
                  )}
                </button>
                
                {/* Camera Toggle */}
                <button
                  onClick={videoCall.toggleVideo}
                  className={`p-1 sm:p-2 lg:p-3 rounded transition-all duration-200 flex items-center justify-center ${
                    !videoCall.isVideoEnabled 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-black bg-opacity-50 hover:bg-opacity-70 text-white'
                  }`}
                  title={videoCall.isVideoEnabled ? "Turn off camera" : "Turn on camera"}
                >
                  {videoCall.isVideoEnabled ? (
                    <Videocam className="text-sm sm:text-base lg:text-lg" />
                  ) : (
                    <VideocamOff className="text-sm sm:text-base lg:text-lg" />
                  )}
                </button>
              </div>
              
              {/* Self Video Visibility Toggle */}
              <button
                onClick={onToggleSelfVideo}
                className="absolute top-1 right-1 sm:top-2 sm:right-2 lg:top-3 lg:right-3 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1 sm:p-2 lg:p-3 rounded transition-all duration-200 z-10 flex items-center justify-center"
                title={showSelfVideo ? "Hide your video from yourself" : "Show your video to yourself"}
              >
                {showSelfVideo ? (
                  <Visibility className="text-sm sm:text-base lg:text-lg" />
                ) : (
                  <VisibilityOff className="text-sm sm:text-base lg:text-lg" />
                )}
              </button>
              </div>
            )}
            
            {/* Hidden local video for stream continuity when self-video is hidden */}
            {!showSelfVideo && (
              <video
                ref={videoCall.localVideoRef}
                autoPlay
                playsInline
                muted
                className="hidden"
              />
            )}
            
            {/* Peer Videos - Show actual videos when available */}
            {peerStreams.map(([participantId, stream]: [string, MediaStream]) => {
              const participant = session.participants.find((p: any) => p.id === participantId);
              return (
                <div key={participantId} className="relative min-w-0 min-h-0 aspect-video lg:aspect-[4/3]">
                  <video
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover rounded-lg bg-gray-200 dark:bg-gray-700 max-w-full"
                    ref={(el) => {
                      if (el && el.srcObject !== stream) {
                        console.log('🟢 VIDEO - Setting stream for peer:', participantId, 'stream active:', stream.active, 'tracks:', stream.getTracks().length);
                        el.srcObject = stream;
                      }
                    }}
                    onError={(e) => {
                      console.error('Peer video error:', e);
                    }}
                    onLoadedMetadata={() => {
                      console.log('🟢 VIDEO - Peer video loaded for:', participantId);
                    }}
                    onCanPlay={() => {
                      console.log('🟢 VIDEO - Peer video can play for:', participantId);
                    }}
                    onStalled={() => {
                      console.warn('🟡 VIDEO - Peer video stalled for:', participantId);
                    }}
                    onSuspend={() => {
                      console.warn('🟡 VIDEO - Peer video suspended for:', participantId);
                    }}
                  />
                  <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black bg-opacity-50 text-white text-xs px-1 sm:px-2 py-1 rounded max-w-[80%] truncate">
                    {participant?.name || 'Unknown'}
                  </div>
                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-green-500 w-2 h-2 rounded-full"></div>
                  
                  {/* Connection quality indicator */}
                  <div className="absolute top-1 left-1 sm:top-2 sm:left-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  </div>
                </div>
              );
            })}
            
            {/* Show placeholders only when we have less than 4 visible participants, more than 2 participants expected, and there's room in the grid */}
            {visibleParticipants < 4 && totalParticipants > 2 && Array.from({ length: Math.min(2, 4 - visibleParticipants) }).map((_, index) => (
              <div key={`placeholder-${index}`} className="relative min-w-0 min-h-0 aspect-video lg:aspect-[4/3]">
                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                  <div className="text-center text-gray-500 dark:text-gray-400 p-1 sm:p-2 lg:p-4">
                    <div className="text-xs sm:text-sm font-medium">
                      Empty
                    </div>
                    <div className="text-xs mt-1 hidden lg:block">
                      Available slot
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Show single waiting placeholder only when we have exactly 1 visible participant (waiting for others) */}
            {visibleParticipants === 1 && totalParticipants === 1 && (
              <div key="waiting-placeholder" className="relative min-w-0 min-h-0 aspect-video lg:aspect-[4/3]">
                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                  <div className="text-center text-gray-500 dark:text-gray-400 p-1 sm:p-2 lg:p-4">
                    <div className="text-xs sm:text-sm font-medium">
                      Waiting...
                    </div>
                    <div className="text-xs mt-1 hidden lg:block">
                      Other participants will appear here
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Compact Status Bar */}
          <div className="mt-3 flex items-center justify-between text-xs text-secondary-600 dark:text-secondary-400">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${videoCall.isConnected ? 'bg-green-400' : videoCall.isConnecting ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
              <span className="truncate">
                {totalParticipants} participant{totalParticipants !== 1 ? 's' : ''}{!showSelfVideo ? ' (self-video hidden)' : ''}
                {videoCall.isConnecting ? ' • Connecting...' : videoCall.isConnected ? ' • Connected' : ' • Disconnected'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {/* Connection Quality Indicator */}
              <div className="flex items-center space-x-1">
                <span className="text-xs">Quality:</span>
                <div className="flex space-x-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-1 rounded-full ${
                        videoCall.isConnected ? 'bg-green-400' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {!videoCall.localVideoRef.current?.srcObject && (
                <button
                  onClick={() => {
                    // Force re-initialisation of local stream
                    if (videoCall.localVideoRef.current && videoCall.localStreamRef?.current) {
                      videoCall.localVideoRef.current.srcObject = videoCall.localStreamRef.current;
                    }
                  }}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Restore Video
                </button>
              )}
              
              {/* Error Recovery Button */}
              {videoCall.error && (
                <button
                  onClick={() => {
                    // Attempt to reconnect
                    if (videoCall.leaveCall) {
                      videoCall.leaveCall().then(() => {
                        // Re-initialize after a short delay
                        setTimeout(() => {
                          if (videoCall.localVideoRef.current && videoCall.localStreamRef?.current) {
                            videoCall.localVideoRef.current.srcObject = videoCall.localStreamRef.current;
                          }
                        }, 1000);
                      });
                    }
                  }}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Reconnect
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
});

SessionVideo.displayName = 'SessionVideo';
