import { useMemo } from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { useSessionOptional } from '../context/SessionContext';
import { SessionCompleteScreen } from '../components/SessionWrapper';
import { DemoOverlay } from '../components/DemoOverlay';
import { getAppConfig, getEnabledGames } from '../config/appConfig';

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
              <span className="shrink-0 rounded bg-gray-700/80 px-2 py-1 text-xs font-medium text-gray-300" title="Edge deployment: runs offline, no cloud required">
                Offline
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
