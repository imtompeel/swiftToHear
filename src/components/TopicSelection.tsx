import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface TopicSelectionProps {
  currentTopic: string;
  participantCount: number;
  onTopicChange: (topic: string) => void;
  onTopicConfirm: (topic: string) => void;
}

export const TopicSelection: React.FC<TopicSelectionProps> = ({
  currentTopic,
  participantCount,
  onTopicChange,
  onTopicConfirm,
}) => {
  const { t } = useTranslation();

  // Sample prompts to inspire users (not categories)
  const samplePrompts = [
    t('shared.common.whatIsAlive'),
    t('dialectic.samplePrompts.whatChallenge'),
    t('dialectic.samplePrompts.whatTransition'),
    t('dialectic.samplePrompts.whatRelationship'),
    t('dialectic.samplePrompts.whatPurpose'),
    t('dialectic.samplePrompts.whatGrowth')
  ];

  const handleTopicSelection = (topic: string) => {
    onTopicChange(topic);
  };

  return (
    <div data-testid="dialectic-session" className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">
          {t('dialectic.topicSelection.title')}
        </h1>
        
        <div className="space-y-8">
          
          {/* Main topic input */}
          <div>
            <label className="block text-lg font-medium text-secondary-700 dark:text-secondary-300 mb-4">
              {t('dialectic.topicSelection.yourTopic')}
            </label>
            <textarea
              data-testid="custom-topic-input"
              rows={3}
              className="w-full px-4 py-3 border-2 border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-accent-500 focus:border-accent-500 dark:bg-secondary-700 dark:text-secondary-100 text-lg"
              placeholder={t('dialectic.topicSelection.topicPlaceholder')}
              value={currentTopic}
              onChange={(e) => onTopicChange(e.target.value)}
            />
            <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
              {t('dialectic.topicSelection.topicGuidance')}
            </p>
          </div>

          {/* Sample prompts for inspiration */}
          <div>
            <h3 className="text-lg font-medium text-secondary-700 dark:text-secondary-300 mb-4">
              {t('dialectic.topicSelection.inspiration')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {samplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  className="p-4 text-left border border-secondary-200 dark:border-secondary-600 rounded-lg hover:border-accent-400 hover:bg-accent-50 dark:hover:bg-accent-900 transition-colors"
                  onClick={() => handleTopicSelection(prompt)}
                >
                  <p className="text-sm text-secondary-700 dark:text-secondary-300">
                    "{prompt}"
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Topic validation and consensus */}
          {currentTopic && (
            <div className="border-t pt-6">
              <div className="bg-accent-50 dark:bg-accent-900 rounded-lg p-6">
                <h4 className="font-semibold text-accent-900 dark:text-accent-100 mb-2">
                  {t('dialectic.topicSelection.yourChosenTopic')}
                </h4>
                <blockquote className="text-accent-800 dark:text-accent-200 italic text-lg mb-4">
                  "{currentTopic}"
                </blockquote>
                
                {/* Depth guidance */}
                <div data-testid="depth-guidance" className="mb-4">
                  <h5 className="font-medium text-accent-900 dark:text-accent-100 mb-2">
                    {t('dialectic.topicSelection.depthGuidance.title')}
                  </h5>
                  <ul className="text-sm text-accent-800 dark:text-accent-200 space-y-1">
                    <li>• {t('dialectic.topicSelection.depthGuidance.personal')}</li>
                    <li>• {t('dialectic.topicSelection.depthGuidance.stakes')}</li>
                    <li>• {t('dialectic.topicSelection.depthGuidance.edge')}</li>
                  </ul>
                </div>

                <button
                  data-testid="validate-custom-topic"
                  className="px-6 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 font-medium"
                  onClick={() => onTopicConfirm(currentTopic)}
                >
                  {t('dialectic.topicSelection.confirmTopic')}
                </button>
              </div>
            </div>
          )}

          {/* Test data for consensus indicator */}
          {participantCount === 3 && currentTopic && (
            <div className="border-t pt-6">
              <div className="text-center text-secondary-600 dark:text-secondary-400 mb-2">
                {t('dialectic.topicSelection.waitingForAgreement')}
              </div>
              <div data-testid="consensus-indicator" className="text-center text-sm text-accent-600 dark:text-accent-400">
                {t('dialectic.topicSelection.consensus', { current: 1, total: 3 })}
              </div>
            </div>
          )}

          {/* Quick transition to life transitions for testing */}
          <button
            data-testid="topic-life-transitions"
            className="hidden"
            onClick={() => handleTopicSelection('Current life transitions and changes')}
          >
            Life Transitions
          </button>
        </div>
      </div>
    </div>
  );
};