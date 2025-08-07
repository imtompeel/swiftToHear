import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface ScribeInterfaceProps {
  onNotesChange?: (notes: string) => void;
  initialNotes?: string;
  roundNumber?: number;
}

export const ScribeInterface: React.FC<ScribeInterfaceProps> = ({
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
      className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('dialectic.assistance.scribe.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {t('dialectic.assistance.scribe.mainGuidance')}
          </p>
        </div>

        {/* Note-taking Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Session Notes
            </h2>
            <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
              Round {roundNumber}
            </span>
          </div>
          
          <div className="space-y-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('dialectic.assistance.scribe.tools.notesPlaceholder')}
              className="w-full h-24 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            />
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {notes.length} characters captured
            </div>
          </div>
        </div>

        {/* Scribe Guidance - Two Columns */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                S
              </span>
              {t('dialectic.assistance.scribe.guidance.title')}
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                {t('dialectic.assistance.scribe.guidance.captureInsights')}
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                {t('dialectic.assistance.scribe.guidance.avoidTranscription')}
              </li>
            </ul>
          </div>

          {/* Right Column */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                ✍️
              </span>
              Best Practices
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-indigo-500 mr-2">•</span>
                {t('dialectic.assistance.scribe.guidance.lookForPatterns')}
              </li>
              <li className="flex items-start">
                <span className="text-indigo-500 mr-2">•</span>
                {t('dialectic.assistance.scribe.guidance.noteEmerging')}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};