import React, { useState } from 'react';
import { InPersonSession } from './InPersonSession';
import { MobileParticipantInterface } from './MobileParticipantInterface';
import { SessionContext, SessionParticipant } from '../types/sessionContext';

export const InPersonDemo: React.FC = () => {
  const [viewMode, setViewMode] = useState<'host' | 'participant'>('host');
  const [selectedRole, setSelectedRole] = useState<string>('speaker');
  const [participantName, setParticipantName] = useState<string>('Demo User');

  // Mock session data
  const mockSession: SessionContext = {
    sessionId: 'demo-session-123',
    sessionName: 'Demo In-Person Session',
    topic: 'What makes effective listening possible?',
    duration: 7, // 7 minutes
    hostId: 'host-1',
    hostName: 'Demo Host',
    participants: [
      { id: 'host-1', name: 'Demo Host', role: 'host', status: 'ready' },
      { id: 'participant-1', name: 'Alice', role: 'speaker', status: 'ready' },
      { id: 'participant-2', name: 'Bob', role: 'listener', status: 'ready' },
      { id: 'participant-3', name: 'Charlie', role: 'scribe', status: 'ready' },
    ],
    status: 'active',
    minParticipants: 3,
    maxParticipants: 4,
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any,
    topicSuggestions: [],
    isGroupSession: false,
    groupConfiguration: {
      groupSize: 4,
      autoAssignRoles: true,
      groupRotation: 'balanced',
      observerStrategy: 'distribute'
    }
  };

  const mockParticipants: SessionParticipant[] = [
    { id: 'host-1', name: 'Demo Host', role: 'host', status: 'ready' },
    { id: 'participant-1', name: 'Alice', role: 'speaker', status: 'ready' },
    { id: 'participant-2', name: 'Bob', role: 'listener', status: 'ready' },
    { id: 'participant-3', name: 'Charlie', role: 'scribe', status: 'ready' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Demo Controls */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                In-Person Session Demo
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Experience the Kahoot-style listening practice tool
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  View:
                </span>
                <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('host')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      viewMode === 'host'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Host
                  </button>
                  <button
                    onClick={() => setViewMode('participant')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      viewMode === 'participant'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Participant
                  </button>
                </div>
              </div>

              {/* Participant Settings */}
              {viewMode === 'participant' && (
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Role
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="speaker">Speaker</option>
                      <option value="listener">Listener</option>
                      <option value="scribe">Scribe</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4">
        {viewMode === 'host' ? (
          <div>
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Host Interface
              </h2>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                This is what the session host sees. They can control the session flow, view connected participants, and manage the QR code for participants to join.
              </p>
            </div>
            <InPersonSession
              session={mockSession}
              currentUserId="host-1"
              currentUserName="Demo Host"
              participants={mockParticipants}
            />
          </div>
        ) : (
          <div>
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h2 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                Participant Interface
              </h2>
              <p className="text-sm text-green-700 dark:text-green-300">
                This simulates what participants see when they scan the QR code on their mobile devices. The interface adapts based on their assigned role.
              </p>
            </div>
            
            {/* Mobile Device Frame */}
            <div className="max-w-sm mx-auto">
              <div className="bg-black rounded-3xl p-2 shadow-2xl">
                <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
                  <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-center">
                    <div className="w-16 h-1 bg-gray-400 rounded-full mx-auto"></div>
                  </div>
                  <div className="h-[600px] overflow-hidden">
                    <MobileParticipantInterface
                      session={mockSession}
                      currentUserId={`demo-${selectedRole}`}
                      currentUserName={participantName}
                      participants={[
                        ...mockParticipants,
                        { 
                          id: `demo-${selectedRole}`, 
                          name: participantName, 
                          role: selectedRole, 
                          status: 'ready' 
                        }
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">For Hosts:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Create a session and display the QR code</li>
                <li>• Participants scan the QR code to join</li>
                <li>• Control session flow and phases</li>
                <li>• Monitor participant connections and roles</li>
                <li>• Manage session timing and transitions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">For Participants:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Scan QR code with mobile device</li>
                <li>• Get role-specific guidance and prompts</li>
                <li>• Real-time updates from host</li>
                <li>• Mobile-optimized interface</li>
                <li>• No video required - face-to-face interaction</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
