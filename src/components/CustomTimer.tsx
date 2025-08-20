import React, { useState } from 'react';
import { QuickTimer } from './QuickTimer';

export const CustomTimer: React.FC = () => {
  const [customDuration, setCustomDuration] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = parseInt(inputValue);
    if (duration > 0 && duration <= 120) { // Max 2 hours
      setCustomDuration(duration);
    }
  };

  const handleReset = () => {
    setCustomDuration(null);
    setInputValue('');
  };

  // If custom duration is set, show the timer
  if (customDuration !== null) {
    return (
      <div>
        <QuickTimer customDuration={customDuration} />
        <div className="fixed top-4 right-4">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors"
          >
            New Timer
          </button>
        </div>
      </div>
    );
  }

  // Show the input form
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900 dark:to-secondary-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-100 mb-4">
            Custom Timer
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Enter the duration in minutes (1-120)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-primary-900 dark:text-primary-100 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              id="duration"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              min="1"
              max="120"
              className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:bg-secondary-700 dark:text-white"
              placeholder="Enter minutes (1-120)"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors font-semibold text-lg"
          >
            Start Timer
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/timer/2"
            className="text-accent-600 dark:text-accent-400 hover:underline"
          >
            ← Back to Quick Timers
          </a>
        </div>
      </div>
    </div>
  );
};
