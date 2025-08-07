import React, { useState, useEffect, useRef } from 'react';
import { useVideoCall } from '../hooks/useVideoCall';
import { testAuthService, TestUser } from '../services/testAuthService';





interface TestSession {
  sessionId: string;
  sessionName: string;
  hostId: string;
  participants: TestUser[];
  status: 'waiting' | 'active' | 'completed';
  currentPhase?: 'topic-selection' | 'hello-checkin' | 'listening' | 'transition' | 'reflection' | 'completed';
  topicSuggestions: Array<{
    id: string;
    topic: string;
    votes: number;
    voters: string[];
    suggestedAt: Date;
  }>;
}

export const SessionTestPage: React.FC = () => {
  const [testUsers] = useState<TestUser[]>(testAuthService.getTestUsers());
  
  const [currentUser, setCurrentUser] = useState<TestUser | null>(null);
  const [testSession, setTestSession] = useState<TestSession | null>(null);
  const [activeView, setActiveView] = useState<'setup' | 'lobby' | 'session'>('setup');
  const [automationMode, setAutomationMode] = useState(false);
  const [testResults, setTestResults] = useState<Array<{ test: string; status: 'pass' | 'fail'; message: string; timestamp: Date }>>([]);
  const [videoConnections, setVideoConnections] = useState<Array<{ userId: string; userName: string; connected: boolean; streamActive: boolean }>>([]);
  
  const automationInterval = useRef<NodeJS.Timeout | null>(null);
  const testStartTime = useRef<Date | null>(null);
  const lastActiveView = useRef<'setup' | 'lobby' | 'session'>('setup');
  const lastSessionId = useRef<string | null>(null);

  // Test configuration
  const [testConfig, setTestConfig] = useState({
    sessionDuration: 5 * 60 * 1000, // 5 minutes
    phaseDurations: {
      helloCheckIn: 30 * 1000, // 30 seconds
      listening: 2 * 60 * 1000, // 2 minutes
      scribeFeedback: 30 * 1000, // 30 seconds
    },
    autoAssignRoles: true,
    autoAddTopicSuggestions: true,
    autoVoteOnTopics: true,
    testVideoConnections: true
  });

  // Real video call functionality with proper authentication
  const isVideoActive = activeView === 'session' && !!testSession?.sessionId && !!testAuthService.getCurrentUserId();
  
  // Only log when state changes to reduce spam
  if (activeView !== lastActiveView.current || testSession?.sessionId !== lastSessionId.current) {
    console.log('Video call state:', {
      activeView,
      sessionId: testSession?.sessionId,
      currentUserId: testAuthService.getCurrentUserId(),
      isVideoActive
    });
    lastActiveView.current = activeView;
    lastSessionId.current = testSession?.sessionId || null;
  }
  
  const videoCall = useVideoCall({
    sessionId: testSession?.sessionId || '',
    currentUserId: testAuthService.getCurrentUserId() || '',
    currentUserName: testAuthService.getCurrentUserName() || '',
    participants: testSession?.participants.map(p => ({
      id: p.id,
      name: p.name,
      role: p.role || 'observer',
      status: 'ready' as const
    })) || [],
    isActive: isVideoActive
  });

  // Initialize test session
  const initializeTestSession = async () => {
    const host = testUsers.find(user => user.isHost) || testUsers[0];
    const participants = testConfig.autoAssignRoles 
      ? assignUniqueRoles(testUsers)
      : testUsers.map(user => ({ ...user, role: undefined }));
    
    console.log('Initializing test session with participants:', participants);
    
    const session: TestSession = {
      sessionId: `test-session-${Date.now()}`,
      sessionName: 'Automated Test Session',
      hostId: host.id,
      participants,
      status: 'waiting',
      currentPhase: 'topic-selection',
      topicSuggestions: testConfig.autoAddTopicSuggestions ? generateSampleTopics() : []
    };
    
    setTestSession(session);
    
    // Automatically authenticate the host user
    try {
      const firebaseUser = await testAuthService.signInAsTestUser(host.id);
      const hostWithRole = participants.find(p => p.id === host.id);
      setCurrentUser(hostWithRole || host);
      setActiveView('lobby');
      
      // Check if we're using anonymous auth
      const isAnonymous = firebaseUser.isAnonymous;
      const authMethod = isAnonymous ? 'anonymous' : 'email/password';
      
      addTestResult('Session Initialization', 'pass', `Test session created successfully. Host authenticated: ${host.name} (UID: ${firebaseUser.uid}, Method: ${authMethod})`);
    } catch (error) {
      console.error('Failed to authenticate host:', error);
      addTestResult('Session Initialization', 'fail', `Session created but host authentication failed: ${error}`);
      // Still set the user but without Firebase auth
      const hostWithRole = participants.find(p => p.id === host.id);
      setCurrentUser(hostWithRole || host);
      setActiveView('lobby');
    }
  };

  // Generate sample topic suggestions
  const generateSampleTopics = () => {
    const topics = [
      'What transitions are we navigating?',
      'How do we build resilience in uncertain times?',
      'What does authentic leadership look like?',
      'How can we foster meaningful connections?',
      'What challenges are we facing as a team?'
    ];
    
    return topics.map((topic, index) => ({
      id: `topic-${index}`,
      topic,
      votes: Math.floor(Math.random() * 3),
      voters: testUsers.slice(0, Math.floor(Math.random() * testUsers.length)).map(u => u.id),
      suggestedAt: new Date()
    }));
  };

  // Get random role for testing

  // Assign unique roles to participants
  const assignUniqueRoles = (participants: TestUser[]): TestUser[] => {
    const availableRoles: Array<'speaker' | 'listener' | 'scribe'> = ['speaker', 'listener', 'scribe'];
    const shuffledRoles = [...availableRoles].sort(() => Math.random() - 0.5);
    
    return participants.map((participant, index) => {
      if (participant.isHost) {
        // Host gets a random role from the available ones
        return {
          ...participant,
          role: shuffledRoles[index % shuffledRoles.length] || 'observer'
        };
      } else if (index < shuffledRoles.length) {
        // First 3 non-host participants get the unique roles
        return {
          ...participant,
          role: shuffledRoles[index]
        };
      } else {
        // Remaining participants get observer role
        return {
          ...participant,
          role: 'observer'
        };
      }
    });
  };

  // Start automation
  const startAutomation = () => {
    if (!testSession) return;
    
    setAutomationMode(true);
    testStartTime.current = new Date();
    addTestResult('Automation Started', 'pass', 'Automated testing sequence initiated');
    
    // Start session
    setTimeout(() => {
      startSession();
    }, 2000);
    
    // Set up automation intervals
    automationInterval.current = setInterval(() => {
      runAutomationStep();
    }, 5000); // Check every 5 seconds
  };

  // Stop automation
  const stopAutomation = () => {
    setAutomationMode(false);
    if (automationInterval.current) {
      clearInterval(automationInterval.current);
      automationInterval.current = null;
    }
    addTestResult('Automation Stopped', 'pass', 'Automated testing sequence stopped');
  };

  // Start session
  const startSession = () => {
    if (!testSession) return;
    
    setTestSession(prev => prev ? {
      ...prev,
      status: 'active',
      currentPhase: 'hello-checkin'
    } : null);
    
    setActiveView('session');
    addTestResult('Session Started', 'pass', 'Session moved to hello-checkin phase');
    
    // Give the video call hook time to initialize before checking
    setTimeout(() => {
      if (testConfig.testVideoConnections) {
        checkVideoConnections();
      }
    }, 2000);
  };

  // Run automation step
  const runAutomationStep = () => {
    if (!testSession || !automationMode) return;
    
    const elapsed = testStartTime.current ? Date.now() - testStartTime.current.getTime() : 0;
    
    // Phase transitions based on elapsed time
    if (elapsed > testConfig.phaseDurations.helloCheckIn && testSession.currentPhase === 'hello-checkin') {
      completeHelloCheckIn();
    } else if (elapsed > testConfig.phaseDurations.helloCheckIn + testConfig.phaseDurations.listening && testSession.currentPhase === 'listening') {
      completeListeningPhase();
    } else if (elapsed > testConfig.phaseDurations.helloCheckIn + testConfig.phaseDurations.listening + testConfig.phaseDurations.scribeFeedback && testSession.currentPhase === 'transition') {
      completeScribeFeedback();
    }
    
    // Check video connections (only after session has been active for a few seconds)
    if (testConfig.testVideoConnections && elapsed > 5000) {
      checkVideoConnections();
    }
  };

  // Complete hello check-in phase
  const completeHelloCheckIn = () => {
    console.log('Completing hello check-in phase, moving to listening');
    setTestSession(prev => prev ? {
      ...prev,
      currentPhase: 'listening'
    } : null);
    
    addTestResult('Hello Check-in Complete', 'pass', 'Moved to listening phase');
  };

  // Complete listening phase
  const completeListeningPhase = () => {
    console.log('Completing listening phase, moving to transition');
    setTestSession(prev => prev ? {
      ...prev,
      currentPhase: 'transition'
    } : null);
    
    addTestResult('Listening Phase Complete', 'pass', 'Moved to scribe feedback phase');
  };

  // Complete scribe feedback phase
  const completeScribeFeedback = () => {
    console.log('Completing scribe feedback phase, moving to reflection');
    setTestSession(prev => prev ? {
      ...prev,
      currentPhase: 'reflection'
    } : null);
    
    addTestResult('Scribe Feedback Complete', 'pass', 'Moved to reflection phase');
  };

  // Check real video connections
  const checkVideoConnections = () => {
    if (!videoCall) {
      addTestResult('Video Connections', 'fail', 'Video call hook not available');
      return;
    }
    
    const { isConnected, isConnecting, connectionState, peerStreams, error, localVideoRef } = videoCall;
    
    console.log('Video call state:', { 
      isConnected, 
      isConnecting, 
      connectionState, 
      peerCount: peerStreams.size, 
      error,
      hasLocalVideoRef: !!localVideoRef.current,
      hasLocalVideoStream: !!(localVideoRef.current && localVideoRef.current.srcObject)
    });
    
    // First check if user is authenticated
    const isAuthenticated = testAuthService.isAuthenticated();
    const currentUserId = testAuthService.getCurrentUserId();
    const currentUserName = testAuthService.getCurrentUserName();
    
    console.log('Auth state:', { isAuthenticated, currentUserId, currentUserName });
    
    if (!isAuthenticated || !currentUserId) {
      addTestResult('Video Connections', 'fail', 'User not authenticated with Firebase');
      return;
    }
    
    if (error) {
      addTestResult('Video Connections', 'fail', `Video connection error: ${error}`);
    } else if (isConnected && peerStreams.size > 0) {
      addTestResult('Video Connections', 'pass', `Connected to ${peerStreams.size} peers successfully`);
    } else if (isConnecting) {
      addTestResult('Video Connections', 'pass', 'Video connection in progress...');
    } else if (isConnected && connectionState === 'connected') {
      // For single-user testing, check if local video is working
      const hasLocalVideo = localVideoRef.current && localVideoRef.current.srcObject;
      if (hasLocalVideo) {
        addTestResult('Video Connections', 'pass', `Local video stream active and ready for peer connections (UID: ${currentUserId})`);
      } else {
        addTestResult('Video Connections', 'fail', 'Local video stream not available');
      }
    } else {
      // For single-user testing, check if local video is working even if connection state is disconnected
      const hasLocalVideo = localVideoRef.current && localVideoRef.current.srcObject;
      if (hasLocalVideo) {
        addTestResult('Video Connections', 'pass', `Local video stream active and ready for peer connections (UID: ${currentUserId}) - Single user mode`);
      } else {
        addTestResult('Video Connections', 'fail', `No video connections established. State: ${connectionState}, Connected: ${isConnected}, Connecting: ${isConnecting}`);
      }
    }
  };

  // Add test result
  const addTestResult = (test: string, status: 'pass' | 'fail', message: string) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      timestamp: new Date()
    }]);
  };

  // Switch user
  const switchUser = async (userId: string) => {
    try {
      // Sign in as the test user with Firebase
      const user = await testAuthService.signInAsTestUser(userId);
      
      // First try to find the user in the test session participants (which have roles)
      const participantWithRole = testSession?.participants.find(p => p.id === userId);
      if (participantWithRole) {
        setCurrentUser(participantWithRole);
        addTestResult('User Switch', 'pass', `Switched to user: ${participantWithRole.name} (${participantWithRole.role || 'No role'}) - UID: ${user.uid}`);
        return;
      }
      
      // Fallback to original test users if no session exists
      const testUser = testUsers.find(u => u.id === userId);
      if (testUser) {
        setCurrentUser(testUser);
        addTestResult('User Switch', 'pass', `Switched to user: ${testUser.name} - UID: ${user.uid}`);
      }
    } catch (error) {
      console.error('Failed to switch user:', error);
      addTestResult('User Switch', 'fail', `Failed to switch user: ${error}`);
    }
  };

  // Reset test
  const resetTest = () => {
    stopAutomation();
    setTestSession(null);
    setCurrentUser(null);
    setActiveView('setup');
    setTestResults([]);
    setVideoConnections([]);
    testStartTime.current = null;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (automationInterval.current) {
        clearInterval(automationInterval.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Session Test Page
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Automated testing interface for multi-user session functionality
          </p>
        </div>

        {/* Test Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Test Setup */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Test Configuration
              </h2>
              
              {/* Test Users */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Test Users
                </h3>
                <div className="space-y-2">
                  {(testSession?.participants || testUsers).map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email} {user.isHost && '(Host)'}
                          {user.role && (
                            <span className="ml-2 text-blue-600 dark:text-blue-400">
                              Role: {user.role}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => switchUser(user.id)}
                        className={`px-3 py-1 text-sm rounded ${
                          currentUser?.id === user.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {currentUser?.id === user.id ? 'Active' : 'Switch'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Test Settings */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Test Settings
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={testConfig.autoAssignRoles}
                      onChange={(e) => setTestConfig(prev => ({ ...prev, autoAssignRoles: e.target.checked }))}
                      className="mr-2"
                    />
                    Auto-assign roles
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={testConfig.autoAddTopicSuggestions}
                      onChange={(e) => setTestConfig(prev => ({ ...prev, autoAddTopicSuggestions: e.target.checked }))}
                      className="mr-2"
                    />
                    Auto-add topic suggestions
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={testConfig.testVideoConnections}
                      onChange={(e) => setTestConfig(prev => ({ ...prev, testVideoConnections: e.target.checked }))}
                      className="mr-2"
                    />
                    Test video connections
                  </label>
                </div>
              </div>

              {/* Test Controls */}
              <div className="space-y-3">
                <button
                  onClick={initializeTestSession}
                  disabled={activeView !== 'setup'}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Initialize Test Session
                </button>
                
                <button
                  onClick={startAutomation}
                  disabled={!testSession || automationMode}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Start Automation
                </button>
                
                <button
                  onClick={stopAutomation}
                  disabled={!automationMode}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Stop Automation
                </button>
                
                <button
                  onClick={resetTest}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Reset Test
                </button>
              </div>
            </div>
          </div>

          {/* Center Panel - Main Content */}
          <div className="lg:col-span-2">
            {activeView === 'setup' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Test Setup
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Configure your test settings and click "Initialize Test Session" to begin.
                </p>
              </div>
            )}

            {activeView === 'lobby' && testSession && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Test Lobby
                </h2>
                <div className="mb-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Session: {testSession.sessionName}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Current User: {currentUser?.name} ({currentUser?.role || 'No role'})
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Participants: {testSession.participants.length}
                  </p>
                  
                  {/* Show all participants and their roles */}
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">All Participants & Roles:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {testSession.participants.map(participant => (
                        <div key={participant.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                          <span className="font-medium">{participant.name}</span>
                          {participant.isHost && <span className="text-blue-600 dark:text-blue-400 ml-1">(Host)</span>}
                          <span className="text-gray-500 dark:text-gray-400 ml-2">
                            {participant.role || 'No role'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {testConfig.autoAddTopicSuggestions && testSession.topicSuggestions.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Topic Suggestions
                    </h3>
                    <div className="space-y-2">
                      {testSession.topicSuggestions.map(topic => (
                        <div key={topic.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {topic.topic}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {topic.votes} votes
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <button
                  onClick={startSession}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Start Session
                </button>
              </div>
            )}

            {activeView === 'session' && testSession && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Test Session
                </h2>
                <div className="mb-4">
                  <div className="mb-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Session Status</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                        <div className="text-sm text-blue-600 dark:text-blue-400">Current Phase</div>
                        <div className="font-medium text-blue-900 dark:text-blue-100">{testSession.currentPhase}</div>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                        <div className="text-sm text-green-600 dark:text-green-400">Status</div>
                        <div className="font-medium text-green-900 dark:text-green-100">{testSession.status}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Current User</h3>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="font-medium text-gray-900 dark:text-white">{currentUser?.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Role: {currentUser?.role || 'No role'} {currentUser?.isHost && '(Host)'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Phase Progress */}
                  <div className="mb-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Phase Progress</h3>
                    <div className="space-y-2">
                      {['hello-checkin', 'listening', 'transition', 'reflection', 'completed'].map((phase, index) => (
                        <div key={phase} className="flex items-center">
                          <div className={`w-4 h-4 rounded-full mr-3 ${
                            testSession.currentPhase === phase 
                              ? 'bg-blue-500' 
                              : index < ['hello-checkin', 'listening', 'transition', 'reflection', 'completed'].indexOf(testSession.currentPhase || 'hello-checkin')
                                ? 'bg-green-500'
                                : 'bg-gray-300'
                          }`}></div>
                          <span className={`text-sm ${
                            testSession.currentPhase === phase 
                              ? 'font-medium text-blue-600 dark:text-blue-400' 
                              : index < ['hello-checkin', 'listening', 'transition', 'reflection', 'completed'].indexOf(testSession.currentPhase || 'hello-checkin')
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-400'
                          }`}>
                            {phase.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Video Connection Status */}
                {testConfig.testVideoConnections && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Video Connections
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {videoConnections.map(connection => (
                        <div key={connection.userId} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {connection.userName}
                          </div>
                          <div className="text-sm">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                              connection.connected ? 'bg-green-500' : 'bg-red-500'
                            }`}></span>
                            {connection.connected ? 'Connected' : 'Disconnected'}
                          </div>
                          {connection.connected && (
                            <div className="text-sm">
                              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                connection.streamActive ? 'bg-green-500' : 'bg-yellow-500'
                              }`}></span>
                              {connection.streamActive ? 'Stream Active' : 'No Stream'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Real Video Component */}
                {testConfig.testVideoConnections && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Real WebRTC Video Testing
                    </h3>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      {/* Local Video Display */}
                      <div className="mb-4">
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                          Your Camera Feed
                        </h4>
                        <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                          <video
                            ref={videoCall.localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            {currentUser?.name} - {currentUser?.role}
                          </div>
                        </div>
                        
                        {/* Video Controls */}
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={videoCall.toggleMute}
                            className={`px-3 py-2 text-sm rounded-md font-medium transition-colors ${
                              videoCall.isMuted 
                                ? 'bg-red-500 hover:bg-red-600 text-white' 
                                : 'bg-gray-300 hover:bg-gray-400 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white'
                            }`}
                          >
                            {videoCall.isMuted ? '🔇 Unmute' : '🔊 Mute'}
                          </button>
                          <button
                            onClick={videoCall.toggleVideo}
                            className={`px-3 py-2 text-sm rounded-md font-medium transition-colors ${
                              !videoCall.isVideoEnabled 
                                ? 'bg-red-500 hover:bg-red-600 text-white' 
                                : 'bg-gray-300 hover:bg-gray-400 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white'
                            }`}
                          >
                            {videoCall.isVideoEnabled ? '📹 Stop Video' : '📹 Start Video'}
                          </button>
                        </div>
                        
                        {/* Connection Status */}
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          Status: <span className={`${
                            videoCall.connectionState === 'connected' 
                              ? 'text-green-600 dark:text-green-400' 
                              : videoCall.connectionState === 'connecting'
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {videoCall.connectionState === 'connected' ? 'Connected' : 
                             videoCall.connectionState === 'connecting' ? 'Connecting...' : 
                             'Disconnected'}
                          </span>
                          {videoCall.error && (
                            <div className="mt-1 text-red-600 dark:text-red-400 text-xs">
                              Error: {videoCall.error}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Peer Video Streams Display */}
                    <div className="mt-4">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                        All Participant Streams
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Current User's Stream */}
                        <div className="bg-gray-200 dark:bg-gray-600 rounded-lg p-3">
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            {currentUser?.name} (You) - {currentUser?.role}
                          </h5>
                          <video
                            ref={videoCall.localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-32 object-cover rounded"
                          />
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={videoCall.toggleMute}
                              className={`px-2 py-1 text-xs rounded ${
                                videoCall.isMuted ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-700'
                              }`}
                            >
                              {videoCall.isMuted ? 'Unmute' : 'Mute'}
                            </button>
                            <button
                              onClick={videoCall.toggleVideo}
                              className={`px-2 py-1 text-xs rounded ${
                                !videoCall.isVideoEnabled ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-700'
                              }`}
                            >
                              {videoCall.isVideoEnabled ? 'Stop Video' : 'Start Video'}
                            </button>
                          </div>
                        </div>
                        
                        {/* Peer Streams */}
                        {Array.from(videoCall.peerStreams.entries()).map(([participantId, stream]) => {
                          const participant = testSession.participants.find(p => p.id === participantId);
                          return (
                            <div key={participantId} className="bg-gray-200 dark:bg-gray-600 rounded-lg p-3">
                              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                {participant?.name || 'Unknown'} - {participant?.role || 'Unknown'}
                              </h5>
                              <video
                                autoPlay
                                playsInline
                                className="w-full h-32 object-cover rounded"
                                ref={(el) => {
                                  if (el) el.srcObject = stream;
                                }}
                              />
                              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                Stream Active: {stream.active ? 'Yes' : 'No'}
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* Placeholder for participants without streams */}
                        {testSession.participants
                          .filter(p => p.id !== currentUser?.id && !videoCall.peerStreams.has(p.id))
                          .map(participant => (
                            <div key={participant.id} className="bg-gray-200 dark:bg-gray-600 rounded-lg p-3">
                              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                {participant.name} - {participant.role}
                              </h5>
                              <div className="w-full h-32 bg-gray-300 dark:bg-gray-500 rounded flex items-center justify-center">
                                <span className="text-gray-500 dark:text-gray-400 text-sm">
                                  No stream yet
                                </span>
                              </div>
                              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                Connecting...
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Manual Controls */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Manual Controls</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        console.log('Manual phase transition test');
                        if (testSession?.currentPhase === 'hello-checkin') {
                          completeHelloCheckIn();
                        } else if (testSession?.currentPhase === 'listening') {
                          completeListeningPhase();
                        } else if (testSession?.currentPhase === 'transition') {
                          completeScribeFeedback();
                        }
                      }}
                      disabled={!testSession || !['hello-checkin', 'listening', 'transition'].includes(testSession.currentPhase || '')}
                      className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                    >
                      Manual Next Phase
                    </button>
                    
                    <button
                      onClick={() => {
                        console.log('Switching to automation mode');
                        startAutomation();
                      }}
                      disabled={automationMode}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Start Automation
                    </button>
                    
                    <button
                      onClick={() => {
                        console.log('Stopping automation');
                        stopAutomation();
                      }}
                      disabled={!automationMode}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      Stop Automation
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Test Results
          </h2>
          <div className="max-h-64 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No test results yet.</p>
            ) : (
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className={`p-3 rounded-lg ${
                    result.status === 'pass' 
                      ? 'bg-green-50 dark:bg-green-900' 
                      : 'bg-red-50 dark:bg-red-900'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {result.test}
                      </div>
                      <div className={`px-2 py-1 text-xs rounded ${
                        result.status === 'pass' 
                          ? 'bg-green-200 text-green-800' 
                          : 'bg-red-200 text-red-800'
                      }`}>
                        {result.status.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {result.message}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {result.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
