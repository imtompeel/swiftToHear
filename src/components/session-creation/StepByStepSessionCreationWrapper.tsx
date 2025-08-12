import React, { useEffect } from 'react';
import StepByStepSessionCreation from './StepByStepSessionCreation';
import { useSession } from '../../hooks/useSession';
import { useAuth } from '../../contexts/AuthContext';

const StepByStepSessionCreationWrapper: React.FC = () => {
  const { createSession, error, clearError } = useSession();
  const { user, loading: authLoading } = useAuth();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSessionCreate = async (sessionData: any) => {
    try {
      console.log('Wrapper received session data:', sessionData);
      
      // Create an adaptive session that can switch between single and multi-group modes
      // Start with a regular session that can be upgraded to group mode if needed
      const skipNavigation = sessionData.sessionType === 'in-person';
      
      const createdSession = await createSession({
        sessionName: sessionData.sessionName,
        duration: sessionData.duration,
        topic: sessionData.topic,
        hostId: user?.uid || '',
        hostName: user?.displayName || user?.email || 'Anonymous',
        minParticipants: sessionData.minParticipants,
        maxParticipants: sessionData.maxParticipants,
        sessionType: sessionData.sessionType || 'video',
        groupConfiguration: {
          autoAssignRoles: false // Allow manual role selection for in-person sessions
        }
      }, { skipNavigation });
      
      return createdSession;
    } catch (err) {
      console.error('Failed to create session:', err);
      throw err;
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
      
      <StepByStepSessionCreation 
        onSessionCreate={handleSessionCreate}
      />
    </div>
  );
};

export default StepByStepSessionCreationWrapper;
