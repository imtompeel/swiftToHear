import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface TopicSuggestionsProps {
  hostTopicSuggestions: string[];
  newTopicSuggestion: string;
  onNewTopicSuggestionChange: (value: string) => void;
  onAddTopicSuggestion: () => void;
  onRemoveTopicSuggestion: (index: number) => void;
  onSampleTopicClick: (topic: string) => void;
}

const TopicSuggestions: React.FC<TopicSuggestionsProps> = ({
  hostTopicSuggestions,
  newTopicSuggestion,
  onNewTopicSuggestionChange,
  onAddTopicSuggestion,
  onRemoveTopicSuggestion,
  onSampleTopicClick
}) => {
  const { t } = useTranslation();

  const sampleTopics = [
    'What is alive in you right now?',
    'What challenge are you facing?',
    'What transition are you navigating?',
    'What are you learning about yourself?',
    'What matters most to you in this moment?'
  ];

  return (
    <div className="space-y-4">

      {/* Add new topic suggestion */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            value={newTopicSuggestion}
            onChange={(e) => onNewTopicSuggestionChange(e.target.value)}
            placeholder={t('dialectic.creation.hostTopics.placeholder')}
            className="flex-1 px-4 py-4 text-lg border-2 border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:bg-secondary-700 dark:text-secondary-100 transition-all"
            onKeyPress={(e) => e.key === 'Enter' && onAddTopicSuggestion()}
          />
          <button
            onClick={onAddTopicSuggestion}
            disabled={!newTopicSuggestion.trim()}
            className="px-6 py-4 bg-accent-600 text-white rounded-lg hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-medium"
          >
            {t('dialectic.creation.hostTopics.add')}
          </button>
        </div>
      </div>

      {/* Sample topics for quick addition */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
          {t('dialectic.creation.hostTopics.sampleTopics')}
        </p>
        <div className="flex flex-wrap gap-2">
          {sampleTopics.map((sampleTopic, index) => (
            <button
              key={index}
              onClick={() => onSampleTopicClick(sampleTopic)}
              disabled={hostTopicSuggestions.includes(sampleTopic)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                hostTopicSuggestions.includes(sampleTopic)
                  ? 'bg-accent-100 text-accent-700 cursor-not-allowed'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              {sampleTopic}
            </button>
          ))}
        </div>
      </div>

      {/* Current host topic suggestions */}
      {hostTopicSuggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
            {t('dialectic.creation.hostTopics.currentSuggestions')} ({hostTopicSuggestions.length})
          </p>
          <div className="space-y-2">
            {hostTopicSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-700 rounded-lg"
              >
                <span className="text-secondary-900 dark:text-secondary-100">
                  {suggestion}
                </span>
                <button
                  onClick={() => onRemoveTopicSuggestion(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicSuggestions;
