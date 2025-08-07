import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { SessionCreation } from './SessionCreation';
import { SessionLobby } from './SessionLobby';
import { DialecticSession } from './DialecticSession';

interface TestWindow {
  id: string;
  name: string;
  url: string;
  isOpen: boolean;
  role?: 'speaker' | 'listener' | 'scribe' | 'observer';
  isHost?: boolean;
}

export const AdvancedSessionTestPage: React.FC = () => {
  const { t } = useTranslation();
  const [testWindows, setTestWindows] = useState<TestWindow[]>([
    { id: 'host', name: 'Alice (Host)', url: '', isOpen: false, isHost: true },
    { id: 'participant1', name: 'Bob', url: '', isOpen: false },
    { id: 'participant2', name: 'Charlie', url: '', isOpen: false },
    { id: 'participant3', name: 'Diana', url: '', isOpen: false }
  ]);
  
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [testPhase, setTestPhase] = useState<'setup' | 'session-created' | 'lobby' | 'session'>('setup');
  const [testResults, setTestResults] = useState<Array<{ test: string; status: 'pass' | 'fail'; message: string; timestamp: Date }>>([]);
  const [automationMode, setAutomationMode] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  
  const automationInterval = useRef<NodeJS.Timeout | null>(null);
  const testStartTime = useRef<Date | null>(null);

  // Test configuration
  const [testConfig, setTestConfig] = useState({
    sessionDuration: 15 * 60 * 1000, // 15 minutes
    autoOpenWindows: true,
    autoAssignRoles: true,
    testVideoConnections: true,
    phaseDurations: {
      helloCheckIn: 2 * 60 * 1000, // 2 minutes
      listening: 5 * 60 * 1000, // 5 minutes
      scribeFeedback: 2.5 * 60 * 1000, // 2.5 minutes
    }
  });

  // Generate session ID
  const generateSessionId = () => {
    const sessionId = `test-session-${Date.now()}`;
    setCurrentSessionId(sessionId);
    return sessionId;
  };

  // Create test session
  const createTestSession = () => {
    const sessionId = generateSessionId();
    const baseUrl = window.location.origin;
    
    console.log('Creating test session:', { sessionId, baseUrl });
    
    // Update window URLs
    setTestWindows(prev => {
      const updatedWindows = prev.map((window, index) => {
        const url = index === 0 
          ? `${baseUrl}/practice/lobby/${sessionId}` // Host goes to lobby
          : `${baseUrl}/practice/join/${sessionId}`; // Participants go to join page
        
        console.log(`Window ${window.name} (index ${index}) gets URL: ${url}`);
        
        return {
          ...window,
          url
        };
      });
      
      console.log('Updated test windows:', updatedWindows);
      return updatedWindows;
    });
    
    setTestPhase('session-created');
    addTestResult('Session Creation', 'pass', `Test session created with ID: ${sessionId}`);
    
    // Auto-open windows if enabled
    if (testConfig.autoOpenWindows) {
      setTimeout(() => {
        openAllTestWindows();
      }, 1000);
    }
  };

  // Open all test windows
  const openAllTestWindows = () => {
    console.log('Opening test windows with URLs:', testWindows.map(w => w.url));
    
    testWindows.forEach(testWindow => {
      if (testWindow.url) {
        console.log(`Opening window for ${testWindow.name} with URL: ${testWindow.url}`);
        const newWindow = window.open(testWindow.url, `test-${testWindow.id}`, 'width=1200,height=800');
        if (newWindow) {
          console.log(`Successfully opened window for ${testWindow.name}`);
          setTestWindows(prev => prev.map(w => 
            w.id === testWindow.id ? { ...w, isOpen: true } : w
          ));
        } else {
          console.error(`Failed to open window for ${testWindow.name}`);
        }
      } else {
        console.warn(`No URL for window ${testWindow.name}`);
      }
    });
    
    addTestResult('Window Management', 'pass', `Opened ${testWindows.length} test windows`);
  };

  // Close all test windows
  const closeAllTestWindows = () => {
    // Note: We can't programmatically close windows due to browser security
    // This is just for UI state management
    setTestWindows(prev => prev.map(w => ({ ...w, isOpen: false })));
    addTestResult('Window Management', 'pass', 'Test windows marked as closed');
  };

  // Start automation
  const startAutomation = () => {
    setAutomationMode(true);
    testStartTime.current = new Date();
    addTestResult('Automation Started', 'pass', 'Automated testing sequence initiated');
    
    // Set up automation intervals
    automationInterval.current = setInterval(() => {
      runAutomationStep();
    }, 10000); // Check every 10 seconds
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

  // Run automation step
  const runAutomationStep = () => {
    if (!automationMode) return;
    
    const elapsed = testStartTime.current ? Date.now() - testStartTime.current.getTime() : 0;
    
    // Simulate phase transitions
    if (elapsed > testConfig.phaseDurations.helloCheckIn && testPhase === 'lobby') {
      simulatePhaseTransition('hello-checkin');
    } else if (elapsed > testConfig.phaseDurations.helloCheckIn + testConfig.phaseDurations.listening && testPhase === 'session') {
      simulatePhaseTransition('listening');
    }
    
    // Check video connections
    if (testConfig.testVideoConnections) {
      checkVideoConnections();
    }
  };

  // Simulate phase transition
  const simulatePhaseTransition = (phase: string) => {
    addTestResult('Phase Transition', 'pass', `Simulated transition to ${phase} phase`);
  };

  // Check video connections
  const checkVideoConnections = () => {
    // This would need to be implemented with actual WebRTC connection checking
    const connectedWindows = testWindows.filter(w => w.isOpen);
    if (connectedWindows.length < testWindows.length) {
      addTestResult('Video Connections', 'fail', `Only ${connectedWindows.length}/${testWindows.length} windows are open`);
    } else {
      addTestResult('Video Connections', 'pass', 'All test windows are open and ready for video testing');
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

  // Reset test
  const resetTest = () => {
    stopAutomation();
    setCurrentSessionId('');
    setTestPhase('setup');
    setTestResults([]);
    setSessionData(null);
    setTestWindows(prev => prev.map(w => ({ ...w, url: '', isOpen: false })));
    testStartTime.current = null;
  };

  // Handle session creation
  const handleSessionCreated = (sessionData: any) => {
    setSessionData(sessionData);
    setTestPhase('lobby');
    addTestResult('Session Data', 'pass', 'Session data received from creation component');
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
            Advanced Session Test Page
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Multi-window testing interface for real session functionality
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Test Controls */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Test Controls
              </h2>
              
              {/* Test Configuration */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Configuration
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={testConfig.autoOpenWindows}
                      onChange={(e) => setTestConfig(prev => ({ ...prev, autoOpenWindows: e.target.checked }))}
                      className="mr-2"
                    />
                    Auto-open test windows
                  </label>
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
                      checked={testConfig.testVideoConnections}
                      onChange={(e) => setTestConfig(prev => ({ ...prev, testVideoConnections: e.target.checked }))}
                      className="mr-2"
                    />
                    Test video connections
                  </label>
                </div>
              </div>

              {/* Test Actions */}
              <div className="space-y-3">
                <button
                  onClick={createTestSession}
                  disabled={testPhase !== 'setup'}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Create Test Session
                </button>
                
                <button
                  onClick={openAllTestWindows}
                  disabled={!currentSessionId}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Open All Windows
                </button>
                
                <button
                  onClick={closeAllTestWindows}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  Close All Windows
                </button>
                
                <button
                  onClick={startAutomation}
                  disabled={!currentSessionId || automationMode}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
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

          {/* Center Panel - Test Windows */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Test Windows
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                {testWindows.map(testWindow => (
                  <div key={testWindow.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {testWindow.name}
                      </h3>
                      <div className={`w-3 h-3 rounded-full ${
                        testWindow.isOpen ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {testWindow.role && `Role: ${testWindow.role}`}
                      {testWindow.isHost && ' (Host)'}
                    </div>
                    
                    {testWindow.url && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 break-all">
                        {testWindow.url}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          console.log(`Opening window for ${testWindow.name} with URL: ${testWindow.url}`);
                          const newWindow = window.open(testWindow.url, `test-${testWindow.id}`, 'width=1200,height=800');
                          if (newWindow) {
                            console.log(`Successfully opened window for ${testWindow.name}`);
                            setTestWindows(prev => prev.map(w => 
                              w.id === testWindow.id ? { ...w, isOpen: true } : w
                            ));
                          } else {
                            console.error(`Failed to open window for ${testWindow.name}`);
                          }
                        }}
                        disabled={!testWindow.url}
                        className="w-full px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                      >
                        Open Window
                      </button>
                      
                      {testWindow.url && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(testWindow.url);
                            console.log(`Copied URL to clipboard: ${testWindow.url}`);
                          }}
                          className="w-full px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                          Copy URL
                        </button>
                      )}
                      
                      {testWindow.url && (
                        <button
                          onClick={() => {
                            console.log(`Testing URL: ${testWindow.url}`);
                            window.location.href = testWindow.url;
                          }}
                          className="w-full px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Test URL
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Testing Instructions
          </h2>
          <div className="text-blue-800 dark:text-blue-200 space-y-2">
            <p><strong>1. Create Test Session:</strong> Click "Create Test Session" to generate a new session ID.</p>
            <p><strong>2. Open Test Windows:</strong> Click "Open All Windows" to open multiple browser windows for testing.</p>
            <p><strong>3. Manual Testing:</strong> Interact with each window to test the session flow manually.</p>
            <p><strong>4. Video Testing:</strong> Check video connections between different windows.</p>
            <p><strong>5. Automation:</strong> Use "Start Automation" to run automated phase transitions.</p>
            <p><strong>Note:</strong> Due to browser security restrictions, some features may require manual interaction.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
