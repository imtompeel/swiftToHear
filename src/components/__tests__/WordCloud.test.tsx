import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import WordCloud from '../WordCloud';
import { TopicSuggestion } from '../../types/sessionTypes';

vi.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (params) {
        return Object.entries(params).reduce(
          (result, [param, value]) => result.replace(`{{${param}}}`, String(value)),
          key
        );
      }
      return key;
    },
    isLoading: false,
  }),
}));

const suggestions: TopicSuggestion[] = [
  {
    id: 's1',
    topic: 'What is alive in you right now?',
    suggestedBy: 'Alice',
    suggestedByUserId: 'a',
    suggestedAt: new Date(),
    votes: 3,
    voters: ['a', 'b', 'c'],
  },
  {
    id: 's2',
    topic: 'What transition are you navigating?',
    suggestedBy: 'Bob',
    suggestedByUserId: 'b',
    suggestedAt: new Date(),
    votes: 1,
    voters: ['b'],
  },
];

describe('WordCloud', () => {
  it('shows lobby vote counts so the host can choose', () => {
    render(
      <WordCloud
        suggestions={suggestions}
        onTopicSelect={vi.fn()}
      />
    );

    expect(screen.getByTestId('host-topic-picker')).toBeInTheDocument();
    expect(screen.getByText('What is alive in you right now?')).toBeInTheDocument();
    expect(screen.getByText('3 dialectic.lobby.topicSuggestions.votes')).toBeInTheDocument();
    expect(screen.getByText('1 dialectic.lobby.topicSuggestions.votes')).toBeInTheDocument();
  });

  it('lets the host select a topic', () => {
    const onTopicSelect = vi.fn();
    render(
      <WordCloud
        suggestions={suggestions}
        onTopicSelect={onTopicSelect}
      />
    );

    fireEvent.click(screen.getByText('What is alive in you right now?'));
    expect(onTopicSelect).toHaveBeenCalledWith('What is alive in you right now?');
  });

  it('does not let non-hosts select a topic', () => {
    render(<WordCloud suggestions={suggestions} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('dialectic.wordCloud.waitingForHost')).toBeInTheDocument();
  });
});
