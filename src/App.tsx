
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import AdminPanel from './components/AdminPanel';
import SuperadminPanel from './components/SuperadminPanel';
import SuperadminLogin from './components/SuperadminLogin';
import AdminGuide from './components/AdminGuide';
import SafetyGuidelines from './components/SafetyGuidelines';
import { DialecticSession } from './components/DialecticSession';
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

// Import timer components
import { QuickTimer } from './components/QuickTimer';
import { CustomTimer } from './components/CustomTimer';

// Import step-by-step session creation
import StepByStepSessionCreationWrapper from './components/session-creation/StepByStepSessionCreationWrapper';
import { MatchFlow } from './components/matchmaking/MatchFlow';
import { AudienceGateway } from './components/AudienceGateway';
import { AudiencePathLanding } from './components/AudiencePathLanding';
import { ChristadelphianPathLanding } from './components/ChristadelphianPathLanding';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <div className="app-shell">
            <Navigation />
            <Routes>
              <Route path="/" element={<AudienceGateway />} />
              <Route path="/for-churches" element={<AudiencePathLanding audience="church" />} />
              <Route path="/welcome" element={<AudiencePathLanding audience="open" />} />
              <Route path="/christadelphian" element={<ChristadelphianPathLanding />} />
              <Route path="/auth" element={<Auth />} />

              <Route path="/practice" element={<DialecticSession />} />
              <Route path="/practice/match" element={<MatchFlow />} />
              <Route path="/practice/create" element={
                <ProtectedRoute>
                  <StepByStepSessionCreationWrapper />
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
              <Route path="/superadmin" element={<SuperadminPanel />} />
              <Route path="/superadmin/login" element={<SuperadminLogin />} />
              <Route path="/admin/guide" element={<AdminGuide />} />
              <Route path="/admin/safety" element={<SafetyGuidelines />} />
              <Route path="/test" element={<SessionTestPage />} />
              <Route path="/test/advanced" element={<AdvancedSessionTestPage />} />
              <Route path="/test/groups" element={<GroupSessionTestPage />} />
              <Route path="/test/in-person" element={<InPersonDemo />} />
              
              {/* Timer Routes */}
              <Route path="/timer/custom" element={<CustomTimer />} />
              <Route path="/timer/:duration" element={<QuickTimer />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 