import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import { AuthProvider } from './context/AuthContext';
import { DemoProvider } from './context/DemoContext';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { AppShell } from './layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Progress } from './pages/Progress';
import { ClinicianDashboard } from './pages/ClinicianDashboard';
import { VrPlaceholder } from './pages/VrPlaceholder';
import { PianoGame } from './games/PianoGame';
import { BubbleGame } from './games/BubbleGame';
import { GrabCupGame } from './games/GrabCupGame';
import { ButtonGame } from './games/ButtonGame';
import { ReachHoldGame } from './games/ReachHoldGame';
import { FingerTapGame } from './games/FingerTapGame';
import { seedMockSessions } from './utils/seedMockSessions';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function DemoRedirect() {
  const navigate = useNavigate();
  const search = typeof window !== 'undefined' ? window.location.search : '';
  const startPresentation = /[?&]presentation=1/.test(search);
  useEffect(() => {
    seedMockSessions();
    navigate(startPresentation ? '/app?demo=1&presentation=1' : '/app?demo=1', { replace: true });
  }, [navigate, startPresentation]);
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center text-gray-400">
      <p>Loading demo…</p>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface text-gray-100 flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="font-display font-bold text-2xl text-white mb-2">Page not found</h1>
        <Link to="/" className="text-brand-400 hover:underline">Go home</Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <BrowserRouter>
          <DemoProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/demo" element={<DemoRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/app" element={<AppShell />}>
              <Route index element={<Dashboard />} />
              <Route path="progress" element={<Progress />} />
              <Route path="clinician" element={<ClinicianDashboard />} />
              <Route path="vr" element={<VrPlaceholder />} />
              <Route path="piano" element={<PianoGame />} />
              <Route path="bubbles" element={<BubbleGame />} />
              <Route path="grab-cup" element={<GrabCupGame />} />
              <Route path="button" element={<ButtonGame />} />
              <Route path="reach-hold" element={<ReachHoldGame />} />
              <Route path="finger-tap" element={<FingerTapGame />} />
            </Route>
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </DemoProvider>
        </BrowserRouter>
      </SessionProvider>
    </AuthProvider>
  );
}

export default App;
