import React from 'react';
import { SessionCreation } from './SessionCreation';
import { useSession } from '../hooks/useSession';
import { useAuth } from '../contexts/AuthContext';

const SessionCreationWrapper: React.FC = () => {
  const { createSession, error, clearError } = useSession();
  const { user, loading: authLoading } = useAuth();

  const handleSessionCreate = async (sessionData: any) => {
    try {
      await createSession({
        sessionName: sessionData.sessionName,
        duration: sessionData.duration,
        topic: sessionData.topic,
        hostId: sessionData.hostId,
        hostName: sessionData.hostName,
        minParticipants: 2,
        maxParticipants: 4,
        topicSuggestions: sessionData.topicSuggestions || []
      });
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  // Show loading while auth is being determined
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Please sign in to create a session.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={clearError}
            className="text-red-600 hover:text-red-800 underline mt-2"
          >
            Dismiss
          </button>
        </div>
      )}
      
      <SessionCreation 
        onSessionCreate={handleSessionCreate}
      />
    </div>
  );
};

export { SessionCreationWrapper }; 