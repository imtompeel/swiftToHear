import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FivePersonGroupingChoice } from '../FivePersonGroupingChoice';
import React from 'react';

// Mock the translation hook
vi.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'dialectic.fivePersonChoice.title': '5 Participants - Choose Your Format',
        'dialectic.fivePersonChoice.description': 'You have 5 participants. Choose how you\'d like to structure the session:',
        'dialectic.fivePersonChoice.split.title': 'Split into Groups',
        'dialectic.fivePersonChoice.split.badge': '2 + 3 people',
        'dialectic.fivePersonChoice.split.description': 'Create two groups: one with 2 people and one with 3 people',
        'dialectic.fivePersonChoice.split.benefit1': 'Everyone gets active roles',
        'dialectic.fivePersonChoice.split.benefit2': 'More intimate conversations',
        'dialectic.fivePersonChoice.together.title': 'Stay Together',
        'dialectic.fivePersonChoice.together.badge': '5 people + 2 observers',
        'dialectic.fivePersonChoice.together.description': 'Keep all 5 people together with 2 temporary observers',
        'dialectic.fivePersonChoice.together.benefit1': 'Full group experience',
        'dialectic.fivePersonChoice.together.benefit2': 'Observers can rotate in',
        'dialectic.fivePersonChoice.cancel': 'Cancel',
        'dialectic.fivePersonChoice.confirm': 'Confirm Choice'
      };
      return translations[key] || key;
    }
  })
}));

describe('FivePersonGroupingChoice', () => {
  const mockOnChoice = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the modal with title and description', () => {
    render(
      <FivePersonGroupingChoice
        onChoice={mockOnChoice}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('5 Participants - Choose Your Format')).toBeInTheDocument();
    expect(screen.getByText('You have 5 participants. Choose how you\'d like to structure the session:')).toBeInTheDocument();
  });

  it('should render both options with correct titles', () => {
    render(
      <FivePersonGroupingChoice
        onChoice={mockOnChoice}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Split into Groups')).toBeInTheDocument();
    expect(screen.getByText('Stay Together')).toBeInTheDocument();
  });

  it('should show option details correctly', () => {
    render(
      <FivePersonGroupingChoice
        onChoice={mockOnChoice}
        onCancel={mockOnCancel}
      />
    );

    // Check split option details
    expect(screen.getByText('2 + 3 people')).toBeInTheDocument();
    expect(screen.getByText('Create two groups: one with 2 people and one with 3 people')).toBeInTheDocument();
    expect(screen.getByText(/Everyone gets active roles/)).toBeInTheDocument();
    expect(screen.getByText(/More intimate conversations/)).toBeInTheDocument();

    // Check together option details
    expect(screen.getByText('5 people + 2 observers')).toBeInTheDocument();
    expect(screen.getByText('Keep all 5 people together with 2 temporary observers')).toBeInTheDocument();
    expect(screen.getByText(/Full group experience/)).toBeInTheDocument();
    expect(screen.getByText(/Observers can rotate in/)).toBeInTheDocument();
  });

  it('should enable confirm button only when an option is selected', () => {
    render(
      <FivePersonGroupingChoice
        onChoice={mockOnChoice}
        onCancel={mockOnCancel}
      />
    );

    const confirmButton = screen.getByText('Confirm Choice');
    expect(confirmButton).toBeDisabled();

    // Select split option
    const splitOption = screen.getByText('Split into Groups').closest('button');
    fireEvent.click(splitOption!);

    expect(confirmButton).toBeEnabled();
  });

  it('should call onChoice with "split" when split option is selected and confirmed', () => {
    render(
      <FivePersonGroupingChoice
        onChoice={mockOnChoice}
        onCancel={mockOnCancel}
      />
    );

    // Select split option
    const splitOption = screen.getByText('Split into Groups').closest('button');
    fireEvent.click(splitOption!);

    // Confirm choice
    const confirmButton = screen.getByText('Confirm Choice');
    fireEvent.click(confirmButton);

    expect(mockOnChoice).toHaveBeenCalledWith('split');
  });

  it('should call onChoice with "together" when together option is selected and confirmed', () => {
    render(
      <FivePersonGroupingChoice
        onChoice={mockOnChoice}
        onCancel={mockOnCancel}
      />
    );

    // Select together option
    const togetherOption = screen.getByText('Stay Together').closest('button');
    fireEvent.click(togetherOption!);

    // Confirm choice
    const confirmButton = screen.getByText('Confirm Choice');
    fireEvent.click(confirmButton);

    expect(mockOnChoice).toHaveBeenCalledWith('together');
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(
      <FivePersonGroupingChoice
        onChoice={mockOnChoice}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should visually indicate selected option', () => {
    render(
      <FivePersonGroupingChoice
        onChoice={mockOnChoice}
        onCancel={mockOnCancel}
      />
    );

    const splitOption = screen.getByText('Split into Groups').closest('button');
    const togetherOption = screen.getByText('Stay Together').closest('button');

    // Initially no option should be selected
    expect(splitOption).not.toHaveClass('border-blue-500');
    expect(togetherOption).not.toHaveClass('border-green-500');

    // Select split option
    fireEvent.click(splitOption!);
    expect(splitOption).toHaveClass('border-blue-500');
    expect(togetherOption).not.toHaveClass('border-green-500');

    // Select together option
    fireEvent.click(togetherOption!);
    expect(splitOption).not.toHaveClass('border-blue-500');
    expect(togetherOption).toHaveClass('border-green-500');
  });
});
