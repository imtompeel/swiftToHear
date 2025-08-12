import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { TopicSuggestion } from '../types/sessionTypes';

interface WordCloudProps {
  suggestions: TopicSuggestion[];
  onTopicSelect?: (topic: string) => void;
  maxWords?: number;
}

const WordCloud: React.FC<WordCloudProps> = ({
  suggestions,
  onTopicSelect,
  maxWords = 15
}) => {
  const { t } = useTranslation();

  // Get the most popular topics
  const popularTopics = suggestions
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

  // Calculate font sizes based on vote count
  const maxVotes = Math.max(...popularTopics.map(s => s.votes));
  const minVotes = Math.min(...popularTopics.map(s => s.votes));
  const voteRange = maxVotes - minVotes;

  const getFontSize = (votes: number) => {
    if (voteRange === 0) return 'text-lg';
    
    const normalizedVotes = (votes - minVotes) / voteRange;
    if (normalizedVotes >= 0.8) return 'text-3xl font-bold';
    if (normalizedVotes >= 0.6) return 'text-2xl font-semibold';
    if (normalizedVotes >= 0.4) return 'text-xl font-medium';
    if (normalizedVotes >= 0.2) return 'text-lg';
    return 'text-base';
  };

  const getColor = (votes: number) => {
    const normalizedVotes = voteRange === 0 ? 0 : (votes - minVotes) / voteRange;
    if (normalizedVotes >= 0.8) return 'text-accent-600 dark:text-accent-400';
    if (normalizedVotes >= 0.6) return 'text-accent-500 dark:text-accent-300';
    if (normalizedVotes >= 0.4) return 'text-secondary-700 dark:text-secondary-300';
    if (normalizedVotes >= 0.2) return 'text-secondary-600 dark:text-secondary-400';
    return 'text-secondary-500 dark:text-secondary-500';
  };

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4 text-center">
        {t('dialectic.wordCloud.title')}
      </h3>
      
      <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-6 text-center">
        {t('dialectic.wordCloud.description')}
      </p>

      <div className="flex flex-wrap justify-center gap-4 p-4 min-h-[200px] items-center">
        {popularTopics.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onTopicSelect?.(suggestion.topic)}
            className={`
              ${getFontSize(suggestion.votes)}
              ${getColor(suggestion.votes)}
              px-3 py-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 
              transition-all duration-200 transform hover:scale-105
              ${onTopicSelect ? 'cursor-pointer' : 'cursor-default'}
            `}
            title={`${suggestion.topic} (${suggestion.votes} votes)`}
          >
            {suggestion.topic}
          </button>
        ))}
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