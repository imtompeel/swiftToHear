
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';

import AdminPanel from './components/AdminPanel';
import { DialecticSession } from './components/DialecticSession';
import { SessionCreationWrapper } from './components/SessionCreationWrapper';
import { SessionJoinWrapper } from './components/SessionJoinWrapper';
import { SessionLobbyWrapper } from './components/SessionLobbyWrapper';
import { Auth } from './components/Auth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SessionTestPage } from './components/SessionTestPage';
import { AdvancedSessionTestPage } from './components/AdvancedSessionTestPage';
import { GroupSessionTestPage } from './components/GroupSessionTestPage';
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
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/test" element={<SessionTestPage />} />
              <Route path="/test/advanced" element={<AdvancedSessionTestPage />} />
              <Route path="/test/groups" element={<GroupSessionTestPage />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 