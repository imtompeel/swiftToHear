import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { SessionContext, SessionParticipant } from '../types/sessionContext';
import { ScribeGuidance } from './guidance/ScribeGuidance';

interface ScribeInterfaceProps {
  session: SessionContext;
  currentUserId: string;
  currentUserName: string;
  participants: SessionParticipant[];
  videoCall: any;
  onNotesChange?: (notes: string) => void;
  initialNotes?: string;
  roundNumber?: number;
}

export const ScribeInterface: React.FC<ScribeInterfaceProps> = ({
  session: _session,
  currentUserId: _currentUserId,
  currentUserName: _currentUserName,
  participants: _participants,
  videoCall: _videoCall,
  onNotesChange,
  initialNotes = '',
  roundNumber = 1
}) => {
  const { t } = useTranslation();
  const [notes, setNotes] = React.useState(initialNotes);

  // Save notes to parent component when they change
  React.useEffect(() => {
    if (onNotesChange) {
      onNotesChange(notes);
    }
  }, [notes, onNotesChange]);

  // Update notes when initialNotes prop changes
  React.useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  // Clear current notes when round changes (new scribe)
  React.useEffect(() => {
    if (!initialNotes) {
      setNotes('');
    }
  }, [initialNotes]);

  return (
    <div 
      data-testid="scribe-interface"
      className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('dialectic.assistance.scribe.title')}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            {t('dialectic.assistance.scribe.mainGuidance')}
          </p>
        </div>

        {/* Note-taking Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Session Notes
            </h2>
            <span className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-medium mt-1 sm:mt-0">
              Round {roundNumber}
            </span>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('dialectic.assistance.scribe.tools.notesPlaceholder')}
              className="w-full h-20 sm:h-24 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none text-sm sm:text-base"
            />
            
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {notes.length} characters captured
            </div>
          </div>
        </div>

        {/* Scribe Guidance - Two Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <ScribeGuidance className="md:col-span-2" />
        </div>
      </div>
    </div>
  );
};