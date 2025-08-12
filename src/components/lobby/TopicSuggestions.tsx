import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface TopicSuggestionsProps {
  session: any;
  currentUserId: string;
  onAddTopicSuggestion?: (topic: string) => void;
  onVoteForTopic?: (suggestionId: string) => void;
}

const TopicSuggestions: React.FC<TopicSuggestionsProps> = ({
  session,
  currentUserId,
  onAddTopicSuggestion,
  onVoteForTopic
}) => {
  const { t } = useTranslation();
  const [newTopicSuggestion, setNewTopicSuggestion] = useState('');
  const [isAddingTopic, setIsAddingTopic] = useState(false);

  // Sample topics for quick addition
  const sampleTopics = [
    'What is alive in you right now?',
    'What challenge are you facing?',
    'What transition are you navigating?',
    'What are you learning about yourself?',
    'What matters most to you in this moment?'
  ];

  const handleAddTopicSuggestion = async () => {
    if (!newTopicSuggestion.trim()) return;

    const currentParticipant = session.participants.find((p: any) => p.id === currentUserId);
    if (!currentParticipant) return;

    setIsAddingTopic(true);
    try {
      if (onAddTopicSuggestion) {
        await onAddTopicSuggestion(newTopicSuggestion.trim());
      }
      
      setNewTopicSuggestion('');
    } catch (error) {
      console.error('Failed to add topic suggestion:', error);
    } finally {
      setIsAddingTopic(false);
    }
  };

  const handleVoteForTopic = async (suggestionId: string) => {
    try {
      if (onVoteForTopic) {
        await onVoteForTopic(suggestionId);
      }
    } catch (error) {
      console.error('Failed to vote for topic:', error);
    }
  };

  const handleSampleTopicClick = async (sampleTopic: string) => {
    // Check if this topic is already suggested
    const existingSuggestion = session.topicSuggestions?.find(
      (s: any) => s.topic.toLowerCase() === sampleTopic.toLowerCase()
    );
    
    if (existingSuggestion) {
      // If it exists, just vote for it
      await handleVoteForTopic(existingSuggestion.id);
    } else {
      // If it doesn't exist, add it
      setNewTopicSuggestion(sampleTopic);
      await handleAddTopicSuggestion();
    }
  };

  return (
    <div className="space-y-4" data-testid="topic-suggestions-section">
      <h3 className="text-lg font-medium text-primary-900 dark:text-primary-100">
        {t('dialectic.lobby.topicSuggestions.title')}
      </h3>
      
      <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-600 p-4 space-y-4">
        {/* Add new topic suggestion */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTopicSuggestion}
              onChange={(e) => setNewTopicSuggestion(e.target.value)}
              placeholder={t('dialectic.lobby.topicSuggestions.placeholder')}
              className="flex-1 px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:bg-secondary-700 dark:text-secondary-100"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTopicSuggestion()}
              disabled={isAddingTopic}
            />
            <button
              onClick={handleAddTopicSuggestion}
              disabled={!newTopicSuggestion.trim() || isAddingTopic}
              className="px-4 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAddingTopic ? t('dialectic.lobby.topicSuggestions.adding') : t('dialectic.lobby.topicSuggestions.add')}
            </button>
          </div>
        </div>

        {/* Sample topics for quick addition */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
            {t('dialectic.lobby.topicSuggestions.sampleTopics')}
          </p>
          <div className="flex flex-wrap gap-2">
            {sampleTopics.map((sampleTopic, index) => (
              <button
                key={index}
                onClick={() => handleSampleTopicClick(sampleTopic)}
                className="px-3 py-1 text-sm rounded-full bg-secondary-100 text-secondary-700 hover:bg-secondary-200 dark:bg-secondary-700 dark:text-secondary-300 dark:hover:bg-secondary-600 transition-colors"
              >
                {sampleTopic}
              </button>
            ))}
          </div>
        </div>

        {/* Current topic suggestions */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
            {t('dialectic.lobby.topicSuggestions.currentSuggestions')}
          </p>
          
          {session.topicSuggestions && session.topicSuggestions.length > 0 ? (
            <div className="space-y-2">
              {session.topicSuggestions
                .sort((a: any, b: any) => b.votes - a.votes)
                .map((suggestion: any) => {
                  const hasVoted = suggestion.voters.includes(currentUserId);
                  return (
                    <div
                      key={suggestion.id}
                      className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="text-secondary-900 dark:text-secondary-100">
                          {suggestion.topic}
                        </div>
                        <div className="text-xs text-secondary-500 dark:text-secondary-400">
                          {suggestion.votes} {t('dialectic.lobby.topicSuggestions.votes')}
                        </div>
                      </div>
                      <button
                        onClick={() => handleVoteForTopic(suggestion.id)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          hasVoted
                            ? 'bg-accent-500 text-white'
                            : 'bg-secondary-200 text-secondary-700 hover:bg-secondary-300 dark:bg-secondary-600 dark:text-secondary-300 dark:hover:bg-secondary-500'
                        }`}
                      >
                        {hasVoted ? '✓' : 'Vote'}
                      </button>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-secondary-500 dark:text-secondary-400">
                {t('dialectic.lobby.topicSuggestions.noSuggestions')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicSuggestions;
