import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { TopicSuggestion as TopicSuggestionType } from '../types/sessionTypes';

interface TopicSuggestionProps {
  session: any;
  currentUserId: string;
  onAddSuggestion: (topic: string) => Promise<void>;
  onVoteForTopic: (suggestionId: string) => Promise<void>;
}

const TopicSuggestion: React.FC<TopicSuggestionProps> = ({
  session,
  currentUserId,
  onAddSuggestion,
  onVoteForTopic
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [newTopic, setNewTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const suggestions = session?.topicSuggestions || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddSuggestion(newTopic.trim());
      setNewTopic('');
    } catch (error) {
      console.error('Failed to add topic suggestion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (suggestionId: string) => {
    try {
      await onVoteForTopic(suggestionId);
    } catch (error) {
      console.error('Failed to vote for topic:', error);
    }
  };

  const hasVotedFor = (suggestion: TopicSuggestionType) => {
    return suggestion.voters.includes(currentUserId);
  };

  const sampleTopics = [
    'What is alive in you right now?',
    'What challenge are you facing?',
    'What transition are you navigating?',
    'What are you learning about yourself?',
    'What matters most to you in this moment?',
    'What would you like to explore today?',
    'What question is calling to you?',
    'What are you curious about?'
  ];

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
        {t('dialectic.lobby.topicSuggestions.title')}
      </h3>
      
      {/* Add new topic suggestion */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder={t('dialectic.lobby.topicSuggestions.placeholder')}
            className="flex-1 px-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 placeholder-secondary-500 dark:placeholder-secondary-400 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!newTopic.trim() || isSubmitting}
            className="px-6 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? t('dialectic.lobby.topicSuggestions.adding') : t('dialectic.lobby.topicSuggestions.add')}
          </button>
        </div>
      </form>

      {/* Sample topics */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-3">
          {t('dialectic.lobby.topicSuggestions.sampleTopics')}
        </h4>
        <div className="flex flex-wrap gap-2">
          {sampleTopics.map((topic, index) => (
            <button
              key={index}
              onClick={() => setNewTopic(topic)}
              className="px-3 py-1 text-sm bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-full hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Current suggestions */}
      <div>
        <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-3">
          {t('dialectic.lobby.topicSuggestions.currentSuggestions')} ({suggestions.length})
        </h4>
        
        {suggestions.length === 0 ? (
          <p className="text-secondary-500 dark:text-secondary-400 text-sm italic">
            {t('dialectic.lobby.topicSuggestions.noSuggestions')}
          </p>
        ) : (
          <div className="space-y-3">
            {suggestions
              .sort((a: TopicSuggestionType, b: TopicSuggestionType) => b.votes - a.votes)
              .map((suggestion: TopicSuggestionType) => (
                <div
                  key={suggestion.id}
                  className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-700 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-secondary-900 dark:text-secondary-100 font-medium">
                      {suggestion.topic}
                    </p>

                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-secondary-600 dark:text-secondary-400">
                      {suggestion.votes} {t('dialectic.lobby.topicSuggestions.votes')}
                    </span>
                    <button
                      onClick={() => handleVote(suggestion.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        hasVotedFor(suggestion)
                          ? 'bg-accent-600 text-white'
                          : 'bg-secondary-200 dark:bg-secondary-600 text-secondary-700 dark:text-secondary-300 hover:bg-accent-100 dark:hover:bg-accent-900'
                      }`}
                    >
                      {hasVotedFor(suggestion) ? '✓' : '↑'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicSuggestion; 