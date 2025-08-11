import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { SessionContext, SessionParticipant } from '../../types/sessionContext';
import { HoverTimer } from '../HoverTimer';
import { ScribeGuidance } from '../guidance/ScribeGuidance';

interface MobileScribeInterfaceProps {
  session: SessionContext;
  currentUserId: string;
  currentUserName: string;
  participants: SessionParticipant[];
  onNotesChange?: (notes: string) => void;
  initialNotes?: string;
  roundNumber?: number;
  timeRemaining?: number; // in milliseconds
  phaseDuration?: number; // in milliseconds
}

export const MobileScribeInterface: React.FC<MobileScribeInterfaceProps> = ({
  session,
  currentUserId: _currentUserId,
  currentUserName: _currentUserName,
  participants: _participants,
  onNotesChange,
  initialNotes = '',
  roundNumber = 1,
  timeRemaining = 0,
  phaseDuration = 0
}) => {
  const { t } = useTranslation();
  const [notes, setNotes] = React.useState(initialNotes);

  // Save notes to parent component when they change
  React.useEffect(() => {
    if (onNotesChange) {
      onNotesChange(notes);
    }
  }, [notes, onNotesChange]);

  // Clear current notes when round changes (new scribe)
  // Each new scribe should start with a clean slate
  React.useEffect(() => {
    setNotes('');
  }, [roundNumber]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="flex justify-between items-center mb-4">
            <div></div> {/* Spacer */}
            {timeRemaining > 0 && (
              <HoverTimer 
                timeRemaining={timeRemaining}
                phaseDuration={phaseDuration}
                className="text-gray-600 dark:text-gray-300"
              />
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('dialectic.assistance.scribe.title')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t('dialectic.assistance.scribe.mainGuidance')}
          </p>
        </div>

        {/* Previous Scribe Notes Section */}
        {initialNotes && initialNotes.trim() && roundNumber > 1 && (session.currentPhase === 'round' || session.currentPhase === 'scribe-feedback') && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-lg p-4 mb-4 border border-blue-200 dark:border-blue-700">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-semibold text-blue-900 dark:text-blue-100">
                Previous Scribe's Notes
              </h2>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Round {roundNumber - 1}
              </span>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-600">
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {initialNotes}
              </p>
            </div>
            
            <div className="mt-2 text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>Reference these notes above, then write your own fresh notes below</strong>
            </div>
          </div>
        )}

        {/* Note-taking Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Your Notes
            </h2>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
              Round {roundNumber}
            </span>
          </div>
          
          {/* First Round Indicator */}
          {roundNumber === 1 && (
            <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
              <p className="text-sm text-green-700 dark:text-green-300">
                🎯 <strong>First Round:</strong> You're starting the note-taking process. Capture the key insights and themes from this conversation.
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={initialNotes && roundNumber > 1 && (session.currentPhase === 'round' || session.currentPhase === 'scribe-feedback') ? t('dialectic.assistance.scribe.tools.previousNotesPlaceholder') : t('dialectic.assistance.scribe.tools.notesPlaceholder')}
              className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none text-sm"
            />
            
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {notes.length} characters captured
            </div>
          </div>
        </div>

        {/* Scribe Guidance - Stacked for mobile */}
        <div className="space-y-4">
          <ScribeGuidance />
        </div>
      </div>
    </div>
  );
};
