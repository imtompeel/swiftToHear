
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';

import AdminPanel from './components/AdminPanel';
import AdminGuide from './components/AdminGuide';
import SafetyGuidelines from './components/SafetyGuidelines';
import { DialecticSession } from './components/DialecticSession';
import { SessionCreationWrapper } from './components/SessionCreationWrapper';
import { SessionJoinWrapper } from './components/SessionJoinWrapper';
import { SessionLobbyWrapper } from './components/SessionLobbyWrapper';
import { InPersonSessionWrapper } from './components/InPersonSessionWrapper';
import { MobileParticipantWrapper } from './components/MobileParticipantWrapper';
import { Auth } from './components/Auth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SessionTestPage } from './components/SessionTestPage';
import { AdvancedSessionTestPage } from './components/AdvancedSessionTestPage';
import { GroupSessionTestPage } from './components/GroupSessionTestPage';
import { InPersonDemo } from './components/InPersonDemo';
import Navigation from './components/Navigation';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import './i18n/config'; // Initialize i18n

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900 dark:to-secondary-900 transition-colors duration-200">
            <Navigation />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<Auth />} />

              <Route path="/practice" element={<DialecticSession />} />
              <Route path="/practice/create" element={
                <ProtectedRoute>
                  <SessionCreationWrapper />
                </ProtectedRoute>
              } />
              <Route path="/practice/join/:sessionId" element={
                <ProtectedRoute>
                  <SessionJoinWrapper />
                </ProtectedRoute>
              } />
              <Route path="/practice/lobby/:sessionId" element={
                <ProtectedRoute>
                  <SessionLobbyWrapper />
                </ProtectedRoute>
              } />
              
              {/* In-Person Session Routes */}
              <Route path="/in-person/host/:sessionId" element={
                <ProtectedRoute>
                  <InPersonSessionWrapper />
                </ProtectedRoute>
              } />
              <Route path="/in-person/join/:sessionId" element={
                <MobileParticipantWrapper />
              } />
              
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/admin/guide" element={<AdminGuide />} />
              <Route path="/admin/safety" element={<SafetyGuidelines />} />
              <Route path="/test" element={<SessionTestPage />} />
              <Route path="/test/advanced" element={<AdvancedSessionTestPage />} />
              <Route path="/test/groups" element={<GroupSessionTestPage />} />
              <Route path="/test/in-person" element={<InPersonDemo />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 