import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { testAuthService, TestUser } from '../services/testAuthService';
import { FirestoreGroupSessionService, GroupSessionCreateData } from '../services/firestoreGroupSessionService';
import { GroupAssignmentService } from '../services/groupAssignmentService';
import { GroupSessionData, GroupData, GroupConfiguration } from '../types/groupSession';
import { GroupSessionLobby } from './GroupSessionLobby';
import { GroupSession } from './GroupSession';
import { GroupManagementDashboard } from './GroupManagementDashboard';

interface TestGroupSession {
  sessionId: string;
  sessionName: string;
  hostId: string;
  participants: Array<{
    id: string;
    name: string;
    role: string;
    status: 'waiting' | 'ready' | 'active';
  }>;
  status: 'waiting' | 'active' | 'completed';
  groupMode: 'single' | 'multi';
  groupConfiguration: GroupConfiguration;
  groups: GroupData[];
  currentPhase?: 'topic-selection' | 'hello-checkin' | 'listening' | 'transition' | 'reflection' | 'completion' | 'free-dialogue' | 'completed';
  topicSuggestions: Array<{
    id: string;
    topic: string;
    votes: number;
    voters: string[];
    suggestedAt: Date;
  }>;
}

export const GroupSessionTestPage: React.FC = () => {
  const { t } = useTranslation();
  const [testUsers] = useState<TestUser[]>(testAuthService.getTestUsers());
  
  const [currentUser, setCurrentUser] = useState<TestUser | null>(null);
  const [testSession, setTestSession] = useState<TestGroupSession | null>(null);
  
  // Keep ref in sync with state
  useEffect(() => {
    testSessionRef.current = testSession;
  }, [testSession]);
  const [activeView, setActiveView] = useState<'setup' | 'lobby' | 'dashboard' | 'group-session'>('setup');
  const [automationMode, setAutomationMode] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [testResults, setTestResults] = useState<Array<{ test: string; status: 'pass' | 'fail'; message: string; timestamp: Date }>>([]);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  
  const automationInterval = useRef<NodeJS.Timeout | null>(null);
  const testStartTime = useRef<Date | null>(null);
  const lastActiveView = useRef<'setup' | 'lobby' | 'dashboard' | 'group-session'>('setup');
  const automationModeRef = useRef(false); // Use ref for immediate access
  const testSessionRef = useRef<TestGroupSession | null>(null); // Use ref for current session state

  // Test configuration
  const [testConfig, setTestConfig] = useState({
    sessionDuration: 10 * 60 * 1000, // 10 minutes
    phaseDurations: {
      helloCheckIn: 10 * 1000, // 10 seconds (shortened for testing)
      listening: 15 * 1000, // 15 seconds (shortened for testing)
      scribeFeedback: 10 * 1000, // 10 seconds (shortened for testing)
    },
    groupMode: 'multi' as 'single' | 'multi',
    groupSize: 4 as 3 | 4,
    autoAssignRoles: true,
    groupRotation: 'balanced' as 'random' | 'balanced' | 'manual',
    observerStrategy: 'distribute' as 'distribute' | 'central',
    autoAddTopicSuggestions: true,
    autoVoteOnTopics: true,
    testVideoConnections: true,
    participantCount: 6 // Number of test participants to create
  });

  // Generate test participants
  const generateTestParticipants = (count: number): TestUser[] => {
    const existingUsers = testAuthService.getTestUsers();
    const participants: TestUser[] = [];
    
    // Use existing test users first
    for (let i = 0; i < Math.min(count, existingUsers.length); i++) {
      participants.push({
        ...existingUsers[i],
        isHost: i === 0, // First user is host
        role: undefined // Will be assigned later
      });
    }
    
    // Generate additional test users if needed
    for (let i = existingUsers.length; i < count; i++) {
      participants.push({
        id: `test-user-${i + 1}`,
        name: `Test User ${i + 1}`,
        email: `test${i + 1}@swifttohear.com`,
        password: 'testpass123',
        isHost: i === 0, // First user is host
        role: undefined // Will be assigned later
      });
    }
    
    return participants;
  };

  // Helper function to add delay
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Initialize test group session
  const initializeTestGroupSession = async () => {
    setIsInitializing(true);
    const participants = generateTestParticipants(testConfig.participantCount);
    const host = participants.find(user => user.isHost) || participants[0];
    
    console.log('Initializing test group session with participants:', participants);
    
    // Create group configuration
    const groupConfiguration: GroupConfiguration = {
      groupSize: testConfig.groupSize,
      autoAssignRoles: testConfig.autoAssignRoles,
      groupRotation: testConfig.groupRotation,
      observerStrategy: testConfig.observerStrategy
    };
    
    // First authenticate the host to get their Firebase UID
    let firebaseUser;
    try {
      // Add a small delay to avoid rate limiting
      await delay(1000);
      firebaseUser = await testAuthService.signInAsTestUser(host.id);
    } catch (error) {
      console.error('Failed to authenticate host:', error);
      addTestResult('Group Session Initialization', 'fail', 
        `Failed to authenticate host: ${error}`);
      return;
    }
    
    // Create session data with Firebase UID
    const sessionData: GroupSessionCreateData = {
      sessionName: 'Automated Large Group Test Session',
      duration: testConfig.sessionDuration,
      topic: 'What challenges are we facing as a team?',
      hostId: firebaseUser.uid, // Use Firebase UID, not test user ID
      hostName: host.name,
      hostRole: 'participant',
      minParticipants: 3,
      maxParticipants: testConfig.participantCount,
      groupMode: testConfig.groupMode,
      groupConfiguration
    };
    
    try {
      console.log('Creating group session with data:', sessionData);
      // Create the group session in Firestore
      const createdSession = await FirestoreGroupSessionService.createGroupSession(sessionData);
      console.log('Group session created successfully:', createdSession);
      
      // Only join the host initially to avoid rate limiting
      // Other participants will be simulated in the test session
      try {
        const hostFirebaseUser = await testAuthService.signInAsTestUser(host.id);
        await FirestoreGroupSessionService.joinGroupSession(
          createdSession.sessionId,
          hostFirebaseUser.uid,
          host.name,
          'participant'
        );
        addTestResult('Participant Joining', 'pass', `Host joined successfully: ${host.name}`);
      } catch (error) {
        console.error(`Failed to join host ${host.name}:`, error);
        addTestResult('Participant Joining', 'fail', `Failed to join host: ${error}`);
      }
      
      // Create our test session object first
      const testGroupSession: TestGroupSession = {
        sessionId: createdSession.sessionId,
        sessionName: createdSession.sessionName,
        hostId: createdSession.hostId,
        participants: participants.map(p => ({
          id: p.id,
          name: p.name,
          role: p.role || '',
          status: 'ready' // Mark all participants as ready for testing
        })),
        status: createdSession.status,
        groupMode: createdSession.groupMode,
        groupConfiguration: createdSession.groupConfiguration,
        groups: [], // Will be populated below
        currentPhase: createdSession.currentPhase,
        topicSuggestions: testConfig.autoAddTopicSuggestions ? generateSampleTopics() : []
      };
      
      // Assign participants to groups using our test participants (not Firestore data)
      const groups = GroupAssignmentService.assignGroups(
        testGroupSession.participants,
        testGroupSession.groupConfiguration
      );
      console.log('Groups assigned:', groups);
      
      // Update the test session with the groups
      testGroupSession.groups = groups;
      
      setTestSession(testGroupSession);
      
      // Set current user and view
      setCurrentUser(host);
      setActiveView('lobby');
      
      addTestResult('Group Session Initialization', 'pass', 
        `Group session created successfully. Host: ${host.name} (UID: ${firebaseUser.uid}). Groups: ${groups.length}`);
    } catch (error) {
      console.error('Failed to create group session:', error);
      addTestResult('Group Session Initialization', 'fail', 
        `Failed to create group session: ${error}`);
    } finally {
      setIsInitializing(false);
    }
  };

  // Generate sample topic suggestions
  const generateSampleTopics = () => {
    const topics = [
      'What transitions are we navigating?',
      'How do we build resilience in uncertain times?',
      'What does authentic leadership look like?',
      'How can we foster meaningful connections?',
      'What challenges are we facing as a team?',
      'How do we maintain balance in our work?',
      'What does success mean to us?',
      'How can we support each other better?'
    ];
    
    return topics.map((topic, index) => ({
      id: `topic-${index}`,
      topic,
      votes: Math.floor(Math.random() * 5),
      voters: testUsers.slice(0, Math.floor(Math.random() * testUsers.length)).map(u => u.id),
      suggestedAt: new Date()
    }));
  };

  // Start automation
  const startAutomation = () => {
    if (!testSession) return;
    
    setAutomationMode(true);
    automationModeRef.current = true; // Set ref immediately
    testStartTime.current = new Date();
    addTestResult('Automation Started', 'pass', 'Automated group session testing sequence initiated');
    
          // Start the group session
      setTimeout(() => {
        startGroupSession();
        
        // Start automation after groups are initialized (3 seconds total delay)
        setTimeout(() => {
        automationInterval.current = setInterval(() => {
          if (!testSessionRef.current) return;
          if (!automationModeRef.current) return;
          runAutomationStep();
        }, 5000); // Check every 5 seconds
      }, 2000); // Wait 2 more seconds after groups are started
    }, 2000);
    

  };

  // Stop automation
  const stopAutomation = () => {
    setAutomationMode(false);
    automationModeRef.current = false; // Set ref immediately
    if (automationInterval.current) {
      clearInterval(automationInterval.current);
      automationInterval.current = null;
    }
    addTestResult('Automation Stopped', 'pass', 'Automated testing sequence stopped');
  };

  // Start group session
  const startGroupSession = async () => {
    if (!testSession) return;
    
    try {
      // Update test session status (no Firestore calls)
      setTestSession(prev => prev ? {
        ...prev,
        status: 'active',
        currentPhase: 'hello-checkin'
      } : null);
      
      setActiveView('dashboard');
      addTestResult('Group Session Started', 'pass', 'Group session moved to hello-checkin phase');
      
      // Start all groups after a short delay
      setTimeout(() => {
        setTestSession(prev => {
          if (!prev) return prev;
          
          const updatedGroups = prev.groups.map(group => ({
            ...group,
            status: 'active' as const,
            currentPhase: 'hello-checkin' as const,
            roundNumber: 1, // Ensure round number is set correctly
            startTime: new Date()
          }));
          
          return {
            ...prev,
            groups: updatedGroups
          };
        });
        
        addTestResult('All Groups Started', 'pass', `Started ${testSession.groups.length} groups`);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to start group session:', error);
      addTestResult('Group Session Start', 'fail', `Failed to start session: ${error}`);
    }
  };

  // Run automation step
  const runAutomationStep = async () => {
    if (!testSessionRef.current || !automationModeRef.current) return;
    
    const elapsed = testStartTime.current ? Date.now() - testStartTime.current.getTime() : 0;
    
    // Check if all groups are in the same phase
    const allGroupsInPhase = (phase: string) => testSessionRef.current.groups.every(g => g.currentPhase === phase);
    
    // Phase transitions based on elapsed time
    if (elapsed > testConfig.phaseDurations.helloCheckIn && allGroupsInPhase('hello-checkin')) {
      await completeHelloCheckIn();
    } else if (elapsed > testConfig.phaseDurations.helloCheckIn + testConfig.phaseDurations.listening && allGroupsInPhase('listening')) {
      await completeListeningPhase();
    } else if (elapsed > testConfig.phaseDurations.helloCheckIn + testConfig.phaseDurations.listening + testConfig.phaseDurations.scribeFeedback && allGroupsInPhase('transition')) {
      await completeScribeFeedback();
    }
  };

  // Complete hello check-in phase
  const completeHelloCheckIn = async () => {
    try {
      // Update test session state directly (no Firestore calls)
      setTestSession(prev => {
        if (!prev) return prev;
        
        const updatedGroups = prev.groups.map(group => ({
          ...group,
          currentPhase: 'listening' as const,
          roundNumber: 1 // Start round 1
        }));
        
        return {
          ...prev,
          currentPhase: 'listening',
          groups: updatedGroups
        };
      });
      
      addTestResult('Hello Check-in Complete', 'pass', 'All groups moved to Round 1 listening phase');
    } catch (error) {
      console.error('Failed to complete hello check-in:', error);
      addTestResult('Hello Check-in Complete', 'fail', `Failed to complete: ${error}`);
    }
  };

  // Complete listening phase
  const completeListeningPhase = async () => {
    try {
      // Update test session state directly (no Firestore calls)
      setTestSession(prev => {
        if (!prev) return prev;
        
        const updatedGroups = prev.groups.map(group => ({
          ...group,
          currentPhase: 'transition' as const
          // Keep same round number - this is scribe feedback for current round
        }));
        
        return {
          ...prev,
          currentPhase: 'transition',
          groups: updatedGroups
        };
      });
      
      const currentRound = testSession?.groups[0]?.roundNumber || 1;
      addTestResult('Listening Phase Complete', 'pass', `All groups moved to Round ${currentRound} scribe feedback phase`);
    } catch (error) {
      console.error('Failed to complete listening phase:', error);
      addTestResult('Listening Phase Complete', 'fail', `Failed to complete: ${error}`);
    }
  };

  // Complete scribe feedback phase
  const completeScribeFeedback = async () => {
    try {
      // Update test session state directly (no Firestore calls)
      setTestSession(prev => {
        if (!prev) return prev;
        
        const currentRound = prev.groups[0]?.roundNumber || 1;
        const totalRounds = prev.groups[0]?.participants.length === 3 ? 3 : 4;
        
        if (currentRound >= totalRounds) {
          // Session complete
          const updatedGroups = prev.groups.map(group => ({
            ...group,
            currentPhase: 'completion' as const,
            status: 'completed' as const
          }));
          
          return {
            ...prev,
            currentPhase: 'completion',
            status: 'completed',
            groups: updatedGroups
          };
        } else {
          // Continue to next round
          const updatedGroups = prev.groups.map(group => ({
            ...group,
            currentPhase: 'listening' as const,
            roundNumber: currentRound + 1
          }));
          
          return {
            ...prev,
            currentPhase: 'listening',
            groups: updatedGroups
          };
        }
      });
      
      const currentRound = testSession?.groups[0]?.roundNumber || 1;
      const totalRounds = testSession?.groups[0]?.participants.length === 3 ? 3 : 4;
      
      if (currentRound >= totalRounds) {
        addTestResult('Session Complete', 'pass', `All ${totalRounds} rounds completed`);
      } else {
        addTestResult('Round Complete', 'pass', `Completed round ${currentRound}, starting round ${currentRound + 1}`);
      }
    } catch (error) {
      console.error('Failed to complete scribe feedback:', error);
      addTestResult('Scribe Feedback Complete', 'fail', `Failed to complete: ${error}`);
    }
  };



  // Switch user
  const switchUser = async (userId: string) => {
    try {
      // Find the user in the test session participants
      const sessionParticipant = testSession?.participants.find(p => p.id === userId);
      if (sessionParticipant) {
        // Sign in using the test auth service
        const user = await testAuthService.signInAsTestUser(userId);
        setCurrentUser(sessionParticipant);
        addTestResult('User Switch', 'pass', `Switched to user: ${sessionParticipant.name} - UID: ${user.uid}`);
        return;
      }
      
      addTestResult('User Switch', 'fail', `User ${userId} not found in session`);
    } catch (error) {
      console.error('Failed to switch user:', error);
      addTestResult('User Switch', 'fail', `Failed to switch user: ${error}`);
    }
  };

  // Join a specific group
  const joinGroup = (groupId: string) => {
    setCurrentGroupId(groupId);
    setActiveView('group-session');
    addTestResult('Group Join', 'pass', `Joined group: ${groupId}`);
  };

  // Leave group session
  const leaveGroupSession = () => {
    setCurrentGroupId(null);
    setActiveView('dashboard');
    addTestResult('Group Leave', 'pass', 'Left group session');
  };

  // Group session complete
  const onGroupComplete = () => {
    setCurrentGroupId(null);
    setActiveView('dashboard');
    addTestResult('Group Complete', 'pass', 'Group session completed');
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

  // Reset test
  const resetTest = () => {
    stopAutomation();
    setTestSession(null);
    setCurrentUser(null);
    setActiveView('setup');
    setTestResults([]);
    setCurrentGroupId(null);
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
            Large Group Session Test Page
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Automated testing interface for large group session functionality
          </p>
        </div>

        {/* Test Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Test Setup */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Test Configuration
              </h2>
              
              {/* Test Users */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Test Users ({testConfig.participantCount})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {generateTestParticipants(testConfig.participantCount).map(user => (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user.isHost && '(Host)'}
                        </div>
                      </div>
                      <button
                        onClick={() => switchUser(user.id)}
                        className={`px-2 py-1 text-xs rounded ${
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

              {/* Group Configuration */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Group Configuration
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Group Mode
                    </label>
                    <select
                      value={testConfig.groupMode}
                      onChange={(e) => setTestConfig(prev => ({ ...prev, groupMode: e.target.value as 'single' | 'multi' }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="single">Single Group</option>
                      <option value="multi">Multi-Group</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Group Size
                    </label>
                    <select
                      value={testConfig.groupSize}
                      onChange={(e) => setTestConfig(prev => ({ ...prev, groupSize: parseInt(e.target.value) as 3 | 4 }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value={3}>3 people</option>
                      <option value={4}>4 people</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Participant Count
                    </label>
                    <select
                      value={testConfig.participantCount}
                      onChange={(e) => setTestConfig(prev => ({ ...prev, participantCount: parseInt(e.target.value) }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value={6}>6 participants</option>
                      <option value={8}>8 participants</option>
                      <option value={12}>12 participants</option>
                      <option value={13}>13 participants (test awkward)</option>
                      <option value={14}>14 participants (test awkward)</option>
                      <option value={15}>15 participants (test awkward)</option>
                      <option value={16}>16 participants</option>
                      <option value={17}>17 participants (test awkward)</option>
                      <option value={18}>18 participants (test awkward)</option>
                      <option value={19}>19 participants (test awkward)</option>
                      <option value={20}>20 participants</option>
                    </select>
                  </div>
                  
                  <label className="flex items-center text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={testConfig.autoAssignRoles}
                      onChange={(e) => setTestConfig(prev => ({ ...prev, autoAssignRoles: e.target.checked }))}
                      className="mr-2"
                    />
                    Auto-assign roles
                  </label>
                  
                  <label className="flex items-center text-gray-700 dark:text-gray-300">
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
                  onClick={initializeTestGroupSession}
                  disabled={activeView !== 'setup'}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Initialize Group Session
                </button>
                
                <button
                  onClick={startAutomation}
                  disabled={!testSession || automationMode}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Automation
                </button>
                
                <button
                  onClick={stopAutomation}
                  disabled={!automationMode}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Stop Automation
                </button>
                
                <button
                  onClick={resetTest}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Reset Test
                </button>
                
                {testSession && (
                  <button
                    onClick={() => setActiveView('dashboard')}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    View Dashboard
                  </button>
                )}
                
                {/* Quick Test Buttons for Awkward Numbers */}
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    Quick Test Awkward Numbers
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setTestConfig(prev => ({ ...prev, participantCount: 13 }))}
                      className="px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300"
                    >
                      13 (4,4,3,2)
                    </button>
                    <button
                      onClick={() => setTestConfig(prev => ({ ...prev, participantCount: 14 }))}
                      className="px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300"
                    >
                      14 (4,4,3,3)
                    </button>
                    <button
                      onClick={() => setTestConfig(prev => ({ ...prev, participantCount: 15 }))}
                      className="px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300"
                    >
                      15 (4,4,4,3)
                    </button>
                    <button
                      onClick={() => setTestConfig(prev => ({ ...prev, participantCount: 17 }))}
                      className="px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300"
                    >
                      17 (4,4,4,3,2)
                    </button>
                    <button
                      onClick={() => setTestConfig(prev => ({ ...prev, participantCount: 18 }))}
                      className="px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300"
                    >
                      18 (4,4,4,3,3)
                    </button>
                    <button
                      onClick={() => setTestConfig(prev => ({ ...prev, participantCount: 19 }))}
                      className="px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300"
                    >
                      19 (4,4,4,4,3)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel - Main Content */}
          <div className="lg:col-span-3">
            {activeView === 'setup' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Test Setup
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Configure your group session settings and click "Initialize Group Session" to begin.
                </p>
                
                {isInitializing && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-blue-800 dark:text-blue-200">Initializing group session...</span>
                    </div>
                  </div>
                )}
                
                {/* Preview of group assignment */}
                {testConfig.participantCount > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Group Assignment Preview
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {(() => {
                        const participants = generateTestParticipants(testConfig.participantCount);
                        const groups = GroupAssignmentService.assignGroups(participants, {
                          groupSize: testConfig.groupSize,
                          autoAssignRoles: testConfig.autoAssignRoles,
                          groupRotation: testConfig.groupRotation,
                          observerStrategy: testConfig.observerStrategy
                        });
                        
                        return groups.map((group, index) => (
                          <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                              Group {String.fromCharCode(65 + index)} ({group.participants.length} people)
                            </h4>
                            <div className="space-y-1">
                              {group.participants.map(participant => (
                                <div key={participant.id} className="text-sm text-gray-600 dark:text-gray-400">
                                  {participant.name} - {participant.role || 'No role'}
                                </div>
                              ))}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeView === 'lobby' && testSession && (
              <GroupSessionLobby
                session={{
                  sessionId: testSession.sessionId,
                  sessionName: testSession.sessionName,
                  participants: testSession.participants,
                  groupMode: testSession.groupMode,
                  groupConfiguration: testSession.groupConfiguration
                }}
                currentUserId={currentUser?.id || ''}
                isHost={currentUser?.isHost || false}
                onStartSession={startGroupSession}
                onLeaveSession={resetTest}
                onUpdateReadyState={(userId, isReady) => {
                  // Update participant ready state in test session
                  setTestSession(prev => prev ? {
                    ...prev,
                    participants: prev.participants.map(p => 
                      p.id === userId ? { ...p, status: isReady ? 'ready' : 'waiting' } : p
                    )
                  } : null);
                }}
                onUpdateParticipantRole={(userId, role) => {
                  // Update participant role in test session
                  setTestSession(prev => prev ? {
                    ...prev,
                    participants: prev.participants.map(p => 
                      p.id === userId ? { ...p, role } : p
                    )
                  } : null);
                }}
              />
            )}

            {activeView === 'dashboard' && testSession && (
              <GroupManagementDashboard
                session={{
                  sessionId: testSession.sessionId,
                  sessionName: testSession.sessionName,
                  topic: 'What challenges are we facing as a team?',
                  duration: testConfig.sessionDuration
                }}
                groups={testSession.groups}
                onStartGroup={async (groupId) => {
                  console.log('Starting group:', groupId);
                  try {
                    // Update the test session (no Firestore calls)
                    setTestSession(prev => {
                      if (!prev) return prev;
                      
                      return {
                        ...prev,
                        groups: prev.groups.map(group => 
                          group.groupId === groupId 
                            ? { 
                                ...group, 
                                status: 'active' as const, 
                                currentPhase: 'hello-checkin' as const,
                                startTime: new Date()
                              }
                            : group
                        )
                      };
                    });
                    
                    addTestResult('Group Started', 'pass', `Started group ${groupId}`);
                  } catch (error) {
                    console.error('Failed to start group:', error);
                    addTestResult('Group Started', 'fail', `Failed to start group ${groupId}: ${error}`);
                  }
                }}
                onPauseGroup={(groupId) => {
                  console.log('Pausing group:', groupId);
                  // TODO: Implement group pausing logic
                }}
                onEndGroup={(groupId) => {
                  console.log('Ending group:', groupId);
                  // TODO: Implement group ending logic
                }}
                onStartAllGroups={async () => {
                  console.log('Starting all groups');
                  try {
                    let startedCount = 0;
                    
                    // Update the test session with the new group statuses (no Firestore calls)
                    setTestSession(prev => {
                      if (!prev) return null;
                      
                      const updatedGroups = prev.groups.map(group => {
                        if (group.status === 'waiting') {
                          startedCount++;
                          return {
                            ...group,
                            status: 'active' as const,
                            currentPhase: 'hello-checkin' as const,
                            startTime: new Date()
                          };
                        }
                        return group;
                      });
                      
                      return {
                        ...prev,
                        groups: updatedGroups
                      };
                    });
                    
                    addTestResult('All Groups Started', 'pass', `Started ${startedCount} groups`);
                  } catch (error) {
                    console.error('Failed to start all groups:', error);
                    addTestResult('All Groups Started', 'fail', `Failed to start groups: ${error}`);
                  }
                }}
                onPauseAllGroups={() => {
                  console.log('Pausing all groups');
                  // TODO: Implement pause all groups logic
                }}
                onEndAllGroups={() => {
                  console.log('Ending all groups');
                  // TODO: Implement end all groups logic
                }}
                onMonitorGroup={(groupId) => {
                  console.log('Monitoring group:', groupId);
                  joinGroup(groupId);
                }}
              />
            )}

            {activeView === 'group-session' && testSession && currentGroupId && (
              <GroupSession
                sessionId={testSession.sessionId}
                groupId={currentGroupId}
                currentUserId={currentUser?.id || ''}
                currentUserName={currentUser?.name || ''}
                onLeaveSession={leaveGroupSession}
                onGroupComplete={onGroupComplete}
                // Pass the current group data directly to avoid Firestore calls
                currentGroup={testSession.groups.find(g => g.groupId === currentGroupId) || null}
                session={testSession as any} // Type assertion for compatibility
              />
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
