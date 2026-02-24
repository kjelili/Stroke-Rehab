import { useMemo, useEffect, useState } from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { useSessionOptional } from '../context/SessionContext';
import { SessionCompleteScreen } from '../components/SessionWrapper';
import { DemoOverlay } from '../components/DemoOverlay';
import { getAppConfig, getEnabledGames } from '../config/appConfig';

const HIGH_CONTRAST_KEY = 'neuro-recover-high-contrast';

function useHighContrast() {
  const [on, setOn] = useState(() => {
    try {
      return localStorage.getItem(HIGH_CONTRAST_KEY) === 'true';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (on) document.documentElement.classList.add('theme-high-contrast');
    else document.documentElement.classList.remove('theme-high-contrast');
    try {
      localStorage.setItem(HIGH_CONTRAST_KEY, String(on));
    } catch {
      // ignore
    }
  }, [on]);
  return [on, () => setOn((v) => !v)] as const;
}

function useNavItems() {
  return useMemo(() => {
    const cfg = getAppConfig();
    const items = [
      { to: '/app', label: 'Dashboard', end: true as const },
      { to: '/app/progress', label: 'Progress', end: false as const },
    ];
    getEnabledGames().forEach((g) => {
      items.push({ to: g.path, label: g.label, end: false });
    });
    if (cfg.clinicianDashboardEnabled) {
      items.push({ to: '/app/clinician', label: 'Clinician', end: false });
    }
    if (cfg.vrPlaceholderEnabled) {
      items.push({ to: '/app/vr', label: 'VR/AR', end: false });
    }
    return items;
  }, []);
}

export function AppShell() {
  const session = useSessionOptional();
  const lastCompleted = session?.lastCompletedSummary;
  const clearLastCompleted = session?.clearLastCompleted;
  const navItems = useNavItems();
  const [highContrast, toggleHighContrast] = useHighContrast();

  const showCompleteScreen =
    lastCompleted &&
    clearLastCompleted &&
    typeof lastCompleted.endedAt === 'number';

  return (
    <div className="min-h-screen bg-surface text-gray-100 flex flex-col">
      {showCompleteScreen && lastCompleted && clearLastCompleted && (
        <SessionCompleteScreen summary={lastCompleted} onClose={clearLastCompleted} />
      )}
      <header className="sticky top-0 z-10 border-b border-gray-800 bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 sm:gap-6 h-14 sm:h-16">
            <Link to="/app" className="flex items-center gap-2 font-display font-semibold text-white shrink-0">
              <span className="text-xl" aria-hidden>🧠</span>
              Neuro-Recover
            </Link>
            {getAppConfig().edgeMode && (
              <span
                className="shrink-0 inline-flex items-center gap-1.5 rounded-md bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 text-xs font-medium text-amber-200"
                title="Edge deployment: app runs fully offline, no cloud or MedGemma backend"
              >
                <span aria-hidden>📴</span>
                Edge: Offline
              </span>
            )}
            {!getAppConfig().edgeMode && (getAppConfig().medgemmaBackendUrl?.trim().length ?? 0) > 0 && (
              <span
                className="shrink-0 hidden sm:inline-flex items-center gap-1 rounded bg-brand-500/20 px-2 py-1 text-xs font-medium text-brand-300"
                title="MedGemma (HAI-DEF) backend connected for agentic orchestration and reports"
              >
                MedGemma
              </span>
            )}
            <nav className="flex items-center gap-1 min-w-0 flex-1 justify-center lg:justify-start" aria-label="Main">
              {navItems.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `tap-target rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-brand-500/20 text-brand-400'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
            <button
              type="button"
              onClick={toggleHighContrast}
              className="tap-target rounded-lg px-2 py-1 text-sm text-gray-400 hover:text-brand-400 shrink-0"
              title={highContrast ? 'Turn off high contrast' : 'High contrast'}
              aria-pressed={highContrast}
            >
              {highContrast ? '☀️ Aa' : 'Aa'}
            </button>
            <Link to="/login" className="text-sm text-gray-400 hover:text-brand-400 tap-target rounded-lg px-2 py-1 shrink-0">
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col pb-24">
        <Outlet />
      </main>
      <DemoOverlay />
    </div>
  );
}
