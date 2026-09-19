import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Auth } from './components/Auth';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import './i18n/config'; // Initialize i18n
import { AudienceGateway } from './components/AudienceGateway';
import { AudiencePathLanding } from './components/AudiencePathLanding';

const AdminPanel = lazy(() => import('./components/AdminPanel'));
const SuperadminPanel = lazy(() => import('./components/SuperadminPanel'));
const SuperadminLogin = lazy(() => import('./components/SuperadminLogin'));
const AdminGuide = lazy(() => import('./components/AdminGuide'));
const SafetyGuidelines = lazy(() => import('./components/SafetyGuidelines'));
const DialecticSession = lazy(() =>
  import('./components/DialecticSession').then((module) => ({ default: module.DialecticSession }))
);
const SessionJoinWrapper = lazy(() =>
  import('./components/SessionJoinWrapper').then((module) => ({ default: module.SessionJoinWrapper }))
);
const SessionLobbyWrapper = lazy(() =>
  import('./components/SessionLobbyWrapper').then((module) => ({ default: module.SessionLobbyWrapper }))
);
const InPersonSessionWrapper = lazy(() =>
  import('./components/InPersonSessionWrapper').then((module) => ({ default: module.InPersonSessionWrapper }))
);
const MobileParticipantWrapper = lazy(() =>
  import('./components/MobileParticipantWrapper').then((module) => ({ default: module.MobileParticipantWrapper }))
);
const SessionTestPage = lazy(() =>
  import('./components/SessionTestPage').then((module) => ({ default: module.SessionTestPage }))
);
const AdvancedSessionTestPage = lazy(() =>
  import('./components/AdvancedSessionTestPage').then((module) => ({ default: module.AdvancedSessionTestPage }))
);
const GroupSessionTestPage = lazy(() =>
  import('./components/GroupSessionTestPage').then((module) => ({ default: module.GroupSessionTestPage }))
);
const InPersonDemo = lazy(() =>
  import('./components/InPersonDemo').then((module) => ({ default: module.InPersonDemo }))
);
const QuickTimer = lazy(() =>
  import('./components/QuickTimer').then((module) => ({ default: module.QuickTimer }))
);
const CustomTimer = lazy(() =>
  import('./components/CustomTimer').then((module) => ({ default: module.CustomTimer }))
);
const StepByStepSessionCreationWrapper = lazy(() => import('./components/session-creation/StepByStepSessionCreationWrapper'));
const MatchFlow = lazy(() => import('./components/matchmaking/MatchFlow'));

const RouteFallback: React.FC = () => (
  <div className="flex min-h-[40vh] items-center justify-center text-secondary-600 dark:text-secondary-400">
    Loading...
  </div>
);

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
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<AudienceGateway />} />
                <Route path="/for-churches" element={<AudiencePathLanding audience="church" />} />
                <Route path="/welcome" element={<AudiencePathLanding audience="open" />} />
                <Route path="/christadelphian" element={<AudiencePathLanding audience="christadelphian" />} />
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
            </Suspense>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
