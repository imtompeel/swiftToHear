import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { TopicSuggestion } from '../types/sessionTypes';

interface WordCloudProps {
  suggestions: TopicSuggestion[];
  onTopicSelect?: (topic: string) => void;
  maxWords?: number;
  currentTopic?: string;
}

const WordCloud: React.FC<WordCloudProps> = ({
  suggestions,
  onTopicSelect,
  maxWords = 15,
  currentTopic
}) => {
  const { t } = useTranslation();
  const canSelect = Boolean(onTopicSelect);

  const popularTopics = [...suggestions]
    .sort((a, b) => b.votes - a.votes)
    .slice(0, maxWords);

  if (popularTopics.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-secondary-500 dark:text-secondary-400">
          {t('dialectic.wordCloud.noTopics')}
        </p>
      </div>
    );
  }

  return (
    <div data-testid="host-topic-picker">
      <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-2 text-center">
        {t('dialectic.wordCloud.title')}
      </h3>
      
      <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-6 text-center">
        {t(canSelect ? 'dialectic.wordCloud.description' : 'dialectic.wordCloud.waitingForHost')}
      </p>

      <div className="space-y-2">
        {popularTopics.map((suggestion, index) => {
          const isCurrent = Boolean(currentTopic) && suggestion.topic === currentTopic;
          const voteLabel = `${suggestion.votes} ${t('dialectic.lobby.topicSuggestions.votes')}`;

          const content = (
            <>
              <div className="flex items-start gap-3 min-w-0">
                <span className="text-sm font-medium text-secondary-400 dark:text-secondary-500 w-5 shrink-0 pt-0.5">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-secondary-900 dark:text-secondary-100 font-medium">
                    {suggestion.topic}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-accent-600 dark:text-accent-400 mt-1">
                      {t('dialectic.wordCloud.currentTopic')}
                    </p>
                  )}
                </div>
              </div>
              <span
                className={`shrink-0 text-sm font-semibold px-2.5 py-1 rounded-full ${
                  suggestion.votes > 0
                    ? 'bg-accent-100 text-accent-800 dark:bg-accent-900/40 dark:text-accent-200'
                    : 'bg-secondary-100 text-secondary-600 dark:bg-secondary-700 dark:text-secondary-300'
                }`}
                title={voteLabel}
              >
                {voteLabel}
              </span>
            </>
          );

          if (canSelect) {
            return (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => onTopicSelect?.(suggestion.topic)}
                className={`w-full flex items-center justify-between gap-4 p-3 rounded-lg border text-left transition-colors ${
                  isCurrent
                    ? 'border-accent-400 bg-accent-50 dark:bg-accent-900/20'
                    : 'border-secondary-200 dark:border-secondary-600 hover:border-accent-400 hover:bg-secondary-50 dark:hover:bg-secondary-700'
                }`}
              >
                {content}
              </button>
            );
          }

          return (
            <div
              key={suggestion.id}
              className={`w-full flex items-center justify-between gap-4 p-3 rounded-lg border ${
                isCurrent
                  ? 'border-accent-400 bg-accent-50 dark:bg-accent-900/20'
                  : 'border-secondary-200 dark:border-secondary-600'
              }`}
            >
              {content}
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-secondary-500 dark:text-secondary-400">
          {t('dialectic.wordCloud.legend', { 
            total: suggestions.length,
            displayed: popularTopics.length 
          })}
        </p>
      </div>
    </div>
  );
};

export default WordCloud;
