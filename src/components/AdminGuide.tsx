import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AdminGuide: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
            Swift to Hear - Platform Guide
          </h1>
          <p className="text-lg text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
            A comprehensive guide to using the Swift to Hear listening practice platform for both video and in-person sessions.
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <Link 
            to="/admin"
            className="inline-flex items-center text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Admin Panel
          </Link>
        </div>

        {/* Table of Contents */}
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Table of Contents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <a href="#overview" className="block text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300">
                1. Platform Overview
              </a>
              <a href="#session-types" className="block text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300">
                2. Session Types
              </a>
              <a href="#video-sessions" className="block text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300">
                3. Video Sessions
              </a>
              <a href="#in-person-sessions" className="block text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300">
                4. In-Person Sessions
              </a>
            </div>
            <div className="space-y-2">
              <a href="#roles" className="block text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300">
                5. Participant Roles
              </a>
              <a href="#session-flow" className="block text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300">
                6. Session Flow
              </a>
              <a href="#best-practices" className="block text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300">
                7. Best Practices
              </a>
              <a href="#troubleshooting" className="block text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300">
                8. Troubleshooting
              </a>
            </div>
          </div>
        </div>

        {/* Platform Overview */}
        <div id="overview" className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            1. Platform Overview
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-secondary-700 dark:text-secondary-300 mb-4">
              Swift to Hear is a structured listening practice platform designed to help participants develop deep listening skills through guided conversations. The platform supports both video-based sessions (for remote participants) and in-person sessions (for face-to-face groups).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-accent-50 dark:bg-accent-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-accent-900 dark:text-accent-100 mb-2">Key Features</h3>
                <ul className="text-sm text-accent-800 dark:text-accent-200 space-y-1">
                  <li>• Role-based guidance for each participant</li>
                  <li>• Real-time session management</li>
                  <li>• Structured conversation phases</li>
                  <li>• Timer and progression controls</li>
                  <li>• Note-taking and reflection tools</li>
                </ul>
              </div>
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">Session Structure</h3>
                <ul className="text-sm text-primary-800 dark:text-primary-200 space-y-1">
                  <li>• Check-in phase (2 minutes)</li>
                  <li>• 3 rounds of conversation (5-15 min each)</li>
                  <li>• Scribe feedback between rounds (2.5 min)</li>
                  <li>• Free dialogue phase (optional)</li>
                  <li>• Session completion and reflection</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Session Types */}
        <div id="session-types" className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            2. Session Types
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Video Sessions
              </h3>
              <p className="text-blue-800 dark:text-blue-200 mb-4">
                Perfect for remote teams, online workshops, or when participants are geographically distributed.
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <li>• <strong>Video calls</strong> with all participants visible</li>
                <li>• <strong>Real-time guidance</strong> displayed on each participant's screen</li>
                <li>• <strong>Host controls</strong> for session progression</li>
                <li>• <strong>Role-specific interfaces</strong> with tailored guidance</li>
                <li>• <strong>Automatic role rotation</strong> between rounds</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                In-Person Sessions
              </h3>
              <p className="text-green-800 dark:text-green-200 mb-4">
                Ideal for face-to-face workshops, team building, or classroom settings where participants are physically present.
              </p>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-2">
                <li>• <strong>QR code joining</strong> for easy participant access</li>
                <li>• <strong>Mobile interfaces</strong> optimized for phones/tablets</li>
                <li>• <strong>Host dashboard</strong> for session control</li>
                <li>• <strong>Real-time updates</strong> across all devices</li>
                <li>• <strong>No video required</strong> - face-to-face interaction</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Video Sessions */}
        <div id="video-sessions" className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            3. Video Sessions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                Getting Started
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-secondary-700 dark:text-secondary-300">
                <li>Navigate to <Link to="/practice/create" className="text-accent-600 dark:text-accent-400 hover:underline">Create Session</Link></li>
                <li>Select "Video Call" as the session type</li>
                <li>Choose your round duration (5-15 minutes)</li>
                <li>Click "Create Session" to generate a session link</li>
                <li>Share the session link with participants</li>
                <li>Wait for participants to join, then click "Start Session"</li>
              </ol>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                During the Session
              </h3>
              <ul className="space-y-2 text-secondary-700 dark:text-secondary-300">
                <li>• <strong>Host controls:</strong> Use the "Complete Round" button to progress through phases</li>
                <li>• <strong>Role rotation:</strong> Roles automatically rotate between rounds</li>
                <li>• <strong>Timer:</strong> Each participant sees a countdown timer for their speaking time</li>
                <li>• <strong>Guidance:</strong> Role-specific prompts appear on each participant's screen</li>
                <li>• <strong>Raise hand:</strong> Listeners can signal when they need the speaker to pause</li>
              </ul>
            </div>
          </div>
        </div>

        {/* In-Person Sessions */}
        <div id="in-person-sessions" className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            4. In-Person Sessions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                Host Setup
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-secondary-700 dark:text-secondary-300">
                <li>Navigate to <Link to="/practice/create" className="text-accent-600 dark:text-accent-400 hover:underline">Create Session</Link></li>
                <li>Select "In-Person" as the session type</li>
                <li>Choose your round duration (5-15 minutes)</li>
                <li>Click "Create Session" to generate a QR code</li>
                <li>Display the QR code on a screen or print it out</li>
                <li>Participants scan the QR code with their mobile devices</li>
                <li>Once participants have joined and selected roles, click "Start Session"</li>
              </ol>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                Participant Experience
              </h3>
              <ul className="space-y-2 text-secondary-700 dark:text-secondary-300">
                <li>• <strong>Mobile interface:</strong> Optimized for phones and tablets</li>
                <li>• <strong>Role selection:</strong> Choose from Speaker, Listener, or Scribe</li>
                <li>• <strong>Real-time updates:</strong> Session progress updates automatically</li>
                <li>• <strong>Guidance cards:</strong> Role-specific prompts and instructions</li>
                <li>• <strong>Timer display:</strong> Countdown timer with color-coded progress</li>
                <li>• <strong>Note-taking:</strong> Scribes can capture insights and themes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Participant Roles */}
        <div id="roles" className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            5. Participant Roles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">S</span>
                Speaker
              </h3>
              <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
                Shares thoughts, experiences, and insights while being mindful of pace and pauses.
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Speak slowly and clearly</li>
                <li>• Pause between thoughts</li>
                <li>• Allow space for reflection</li>
                <li>• Share genuine experiences</li>
                <li>• Notice listener signals</li>
              </ul>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">L</span>
                Listener
              </h3>
              <p className="text-green-800 dark:text-green-200 text-sm mb-3">
                Provides full attention and presence, reflecting back what they hear without judgment.
              </p>
              <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                <li>• Listen without preparing responses</li>
                <li>• Notice impulses to interrupt</li>
                <li>• Offer presence and attention</li>
                <li>• Reflect back what you hear</li>
                <li>• Signal when you need space</li>
              </ul>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center">
                <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">S</span>
                Scribe
              </h3>
              <p className="text-purple-800 dark:text-purple-200 text-sm mb-3">
                Captures key insights, themes, and questions that emerge during the conversation.
              </p>
              <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
                <li>• Listen carefully for themes</li>
                <li>• Capture key insights</li>
                <li>• Note emerging questions</li>
                <li>• Record important moments</li>
                <li>• Notes pass to next scribe</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Session Flow */}
        <div id="session-flow" className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            6. Session Flow
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-accent-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
              <div>
                <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">Check-in Phase (2 minutes)</h3>
                <p className="text-secondary-700 dark:text-secondary-300 text-sm">
                  Participants introduce themselves and share their intentions for the session. This helps create a safe, connected space for deeper conversation.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-accent-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
              <div>
                <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">Round 1 (5-15 minutes)</h3>
                <p className="text-secondary-700 dark:text-secondary-300 text-sm">
                  First speaker shares while listener provides full attention. Scribe captures key insights. Host progresses to scribe feedback when ready.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-accent-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
              <div>
                <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">Scribe Feedback (2.5 minutes)</h3>
                <p className="text-secondary-700 dark:text-secondary-300 text-sm">
                  Scribe shares captured insights and themes. This helps participants reflect on what emerged and prepares them for the next round.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-accent-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
              <div>
                <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">Rounds 2 & 3</h3>
                <p className="text-secondary-700 dark:text-secondary-300 text-sm">
                  Process repeats with roles rotating. Each participant experiences all three roles, building comprehensive listening skills.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-accent-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">5</div>
              <div>
                <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">Free Dialogue (Optional)</h3>
                <p className="text-secondary-700 dark:text-secondary-300 text-sm">
                  Participants can continue the conversation naturally, applying the listening skills they've practiced.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div id="best-practices" className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            7. Best Practices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                For Hosts
              </h3>
              <ul className="space-y-2 text-secondary-700 dark:text-secondary-300 text-sm">
                <li>• <strong>Set clear expectations</strong> before starting</li>
                <li>• <strong>Monitor time</strong> and guide transitions smoothly</li>
                <li>• <strong>Create a safe space</strong> for vulnerability</li>
                <li>• <strong>Encourage participation</strong> from all members</li>
                <li>• <strong>Be flexible</strong> with timing if needed</li>
                <li>• <strong>Provide gentle reminders</strong> about roles</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                For Participants
              </h3>
              <ul className="space-y-2 text-secondary-700 dark:text-secondary-300 text-sm">
                <li>• <strong>Arrive on time</strong> and ready to participate</li>
                <li>• <strong>Respect time limits</strong> for each phase</li>
                <li>• <strong>Stay present</strong> and avoid distractions</li>
                <li>• <strong>Be authentic</strong> in your sharing</li>
                <li>• <strong>Practice patience</strong> with the process</li>
                <li>• <strong>Trust the structure</strong> and let it guide you</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div id="troubleshooting" className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            8. Troubleshooting
          </h2>
          <div className="space-y-4">
            <div className="border-l-4 border-yellow-400 pl-4">
              <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">Common Issues</h3>
              <div className="space-y-3 text-sm text-secondary-700 dark:text-secondary-300">
                <div>
                  <strong>Participants can't join:</strong> Check that the session link is correct and hasn't expired. For in-person sessions, ensure the QR code is clearly visible.
                </div>
                <div>
                  <strong>Video/audio problems:</strong> Ask participants to check their browser permissions and ensure they have a stable internet connection.
                </div>
                <div>
                  <strong>Session not progressing:</strong> Make sure the host is clicking "Complete Round" to advance through phases.
                </div>
                <div>
                  <strong>Timer not working:</strong> Refresh the page or check if the session is still active.
                </div>
                <div>
                  <strong>Roles not rotating:</strong> Ensure all participants have selected roles before starting the session.
                </div>
              </div>
            </div>
            <div className="border-l-4 border-green-400 pl-4">
              <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">Tips for Success</h3>
              <ul className="space-y-2 text-sm text-secondary-700 dark:text-secondary-300">
                <li>• Test the platform before running a session with participants</li>
                <li>• Have a backup plan for technical difficulties</li>
                <li>• Keep session links handy for easy sharing</li>
                <li>• Encourage participants to use headphones for better audio quality</li>
                <li>• Consider running a shorter practice session first</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-accent-500 to-primary-500 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-accent-100 mb-6">
            Create your first session and experience the power of structured listening practice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/practice/create"
              className="bg-white text-accent-600 px-6 py-3 rounded-lg font-semibold hover:bg-accent-50 transition-colors duration-200"
            >
              Create a Session
            </Link>
            <Link
              to="/admin"
              className="bg-accent-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent-700 transition-colors duration-200"
            >
              Back to Admin Panel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGuide;
