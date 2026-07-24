import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface TechCheckProps {
  onComplete?: (results: { camera: boolean; microphone: boolean }) => void;
  /** When true, the primary action shows waiting copy instead of continue */
  waitingForOthers?: boolean;
}

export const TechCheck: React.FC<TechCheckProps> = ({
  onComplete,
  waitingForOthers = false,
}) => {
  const { t } = useTranslation();
  const [cameraStatus, setCameraStatus] = useState<'checking' | 'working' | 'failed'>('working');
  const [microphoneStatus, setMicrophoneStatus] = useState<'checking' | 'working' | 'failed'>('working');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    checkDevices();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const checkDevices = async () => {
    try {
      // Stop any previous preview stream before reacquiring
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      streamRef.current = mediaStream;
      setStream(mediaStream);
      
      const videoTracks = mediaStream.getVideoTracks();
      setCameraStatus(videoTracks.length > 0 ? 'working' : 'failed');
      
      const audioTracks = mediaStream.getAudioTracks();
      setMicrophoneStatus(audioTracks.length > 0 ? 'working' : 'failed');

      if (onComplete) {
        onComplete({
          camera: videoTracks.length > 0,
          microphone: audioTracks.length > 0
        });
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setCameraStatus('failed');
      setMicrophoneStatus('failed');
      
      if (onComplete) {
        onComplete({ camera: false, microphone: false });
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checking': return '⏳';
      case 'working': return '✅';
      case 'failed': return '❌';
      default: return '⏳';
    }
  };

  const getStatusText = (status: string, device: string) => {
    const deviceName = device.toLowerCase();
    switch (status) {
      case 'checking': return `${t('dialectic.preparation.techCheck.checking')} ${deviceName}...`;
      case 'working': return `${deviceName} ${t('dialectic.preparation.techCheck.working')}`;
      case 'failed': return `${deviceName} ${t('dialectic.preparation.techCheck.notAvailable')}`;
      default: return `${t('dialectic.preparation.techCheck.checking')} ${deviceName}...`;
    }
  };

  const allReady = cameraStatus === 'working' && microphoneStatus === 'working';
  const anyFailed = cameraStatus === 'failed' || microphoneStatus === 'failed';

  return (
    <div data-testid="tech-check" className="bg-white dark:bg-secondary-800 rounded-lg p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
          {t('dialectic.preparation.techCheck.title')}
        </h3>
        <p className="text-secondary-600 dark:text-secondary-400">
          {t('dialectic.preparation.techCheck.description')}
        </p>
      </div>

      {/* Camera Preview */}
      <div className="mb-6">
        <div className="bg-secondary-900 rounded-lg h-48 flex items-center justify-center mb-4">
          {stream && cameraStatus === 'working' ? (
            <video
              autoPlay
              muted
              ref={(video) => {
                if (video && stream) {
                  video.srcObject = stream;
                }
              }}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="text-white text-center">
              <div className="text-4xl mb-2">📹</div>
              <div>{t('dialectic.preparation.techCheck.cameraPreview')}</div>
            </div>
          )}
        </div>
      </div>

      {/* Device Status */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getStatusIcon(cameraStatus)}</span>
            <span className="text-secondary-900 dark:text-secondary-100">
              {getStatusText(cameraStatus, 'Camera')}
            </span>
          </div>
          {cameraStatus === 'failed' && (
            <button
              onClick={checkDevices}
              className="text-sm text-accent-600 hover:text-accent-700"
            >
              {t('dialectic.preparation.techCheck.retry')}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getStatusIcon(microphoneStatus)}</span>
            <span className="text-secondary-900 dark:text-secondary-100">
              {getStatusText(microphoneStatus, 'Microphone')}
            </span>
          </div>
          {microphoneStatus === 'failed' && (
            <button
              onClick={checkDevices}
              className="text-sm text-accent-600 hover:text-accent-700"
            >
              {t('dialectic.preparation.techCheck.retry')}
            </button>
          )}
        </div>
      </div>

      {/* Status Message */}
      <div className="text-center mb-6">
        {allReady && (
          <div className="text-green-600 dark:text-green-400 font-medium">
            {t('dialectic.preparation.techCheck.allReady')}
          </div>
        )}
        {anyFailed && (
          <div className="text-amber-600 dark:text-amber-400">
            {t('dialectic.preparation.techCheck.someIssues')}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={checkDevices}
          className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700"
        >
          {t('dialectic.preparation.techCheck.checkAgain')}
        </button>
        <button
          type="button"
          disabled={waitingForOthers}
          className={`px-6 py-2 rounded-lg font-medium ${
            waitingForOthers
              ? 'bg-secondary-300 dark:bg-secondary-600 text-secondary-700 dark:text-secondary-200 cursor-wait'
              : allReady
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-accent-600 text-white hover:bg-accent-700'
          }`}
        >
          {waitingForOthers
            ? t('matchmaking.waiting.waitingForOthers')
            : allReady
              ? t('shared.actions.continueToSession')
              : t('dialectic.preparation.techCheck.continueAnyway')}
        </button>
      </div>
    </div>
  );
};
