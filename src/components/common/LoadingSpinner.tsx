import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'accent';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8 sm:h-12 sm:w-12',
    lg: 'h-12 w-12'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    accent: 'border-accent-600'
  };

  return (
    <div 
      className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      role="status"
    />
  );
};
