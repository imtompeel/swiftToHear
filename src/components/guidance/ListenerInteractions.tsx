import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { FirestoreSessionService } from '../../services/firestoreSessionService';

interface ListenerInteractionsProps {
  sessionId: string;
  currentUserId: string;
  className?: string;
}

export const ListenerInteractions: React.FC<ListenerInteractionsProps> = ({
  sessionId,
  currentUserId,
  className = ''
}) => {
  const { t } = useTranslation();
  const [handRaised, setHandRaised] = useState(false);

  const handleRaiseHand = async () => {
    const newHandRaised = !handRaised;
    setHandRaised(newHandRaised);
    
    try {
      await FirestoreSessionService.signalRaisedHand(sessionId, currentUserId, newHandRaised);
      console.log('Listener raised hand:', newHandRaised);
    } catch (error) {
      console.error('Failed to signal raised hand:', error);
      // Revert the local state if the server update failed
      setHandRaised(handRaised);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Speaker Interactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">
            🤚
          </span>
          {t('dialectic.assistance.listener.interactions.title')}
        </h3>
        <div className="space-y-4">
          {/* Raise Hand Button */}
          <div className="text-center">
            <button
              onClick={handleRaiseHand}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                handRaised 
                  ? 'bg-green-600 text-white shadow-lg' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg">🤚</span>
                <span>{t('dialectic.assistance.listener.interactions.raiseHand')}</span>
              </div>
            </button>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {t('dialectic.assistance.listener.interactions.raiseHandDesc')}
            </p>
          </div>

          {/* Memory Test Reminder */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
            <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
              💡 <strong>{t('dialectic.assistance.listener.interactions.notMemoryTest')}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
