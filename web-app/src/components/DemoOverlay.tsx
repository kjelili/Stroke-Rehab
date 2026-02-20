import { useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDemo } from '../context/DemoContext';
import { PRESENTATION_DURATION_SEC } from '../context/DemoContext';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function DemoOverlay() {
  const demo = useDemo();
  const navigate = useNavigate();
  const location = useLocation();
  const autoStartedRef = useRef(false);

  useEffect(() => {
    if (!demo?.isDemoMode || !demo.presentationActive) return;
    const path = demo.steps[demo.currentStep]?.path;
    if (path && path !== location.pathname) navigate(path);
  }, [demo?.isDemoMode, demo?.presentationActive, demo?.currentStep, demo?.steps, location.pathname, navigate]);

  useEffect(() => {
    if (!demo?.isDemoMode || !demo.startPresentation || autoStartedRef.current) return;
    const wantPresentation = /[?&]presentation=1/.test(location.search);
    if (wantPresentation) {
      autoStartedRef.current = true;
      demo.startPresentation();
      navigate(location.pathname + '?demo=1', { replace: true });
    }
  }, [demo?.isDemoMode, demo?.startPresentation, location.search, location.pathname, navigate]);

  if (!demo?.isDemoMode) return null;

  const { currentStep, nextStep, prevStep, steps, presentationActive, presentationElapsed, startPresentation, stopPresentation } = demo;
  const step = steps[currentStep];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-700 bg-surface-elevated/95 backdrop-blur supports-[backdrop-filter]:bg-surface/95 p-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <p className="text-xs text-brand-400 font-medium">
              Step {currentStep + 1} of {steps.length} · {step.time}
            </p>
            {presentationActive && (
              <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                {formatTime(presentationElapsed)} / {formatTime(PRESENTATION_DURATION_SEC)}
              </span>
            )}
          </div>
          <p className="text-white text-sm font-medium">{step.script}</p>
          {step.overlay && (
            <p className="text-brand-300 text-xs mt-1 italic">&ldquo;{step.overlay}&rdquo;</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <a
            href="/app"
            onClick={() => {
              try { sessionStorage.removeItem('neuro-recover-demo'); } catch { /* ignore */ }
              if (presentationActive) stopPresentation();
            }}
            className="tap-target rounded-lg px-2 py-1.5 text-xs text-gray-500 hover:text-gray-300"
          >
            Exit demo
          </a>
          {presentationActive ? (
            <button
              type="button"
              onClick={stopPresentation}
              className="tap-target rounded-lg border border-amber-500/50 px-3 py-2 text-sm text-amber-200 hover:bg-amber-500/20"
            >
              Stop 3‑min
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={startPresentation}
                className="tap-target rounded-lg bg-brand-500 px-3 py-2 text-sm text-white hover:bg-brand-600"
              >
                Start 3‑min presentation
              </button>
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="tap-target rounded-lg border border-gray-600 px-3 py-2 text-sm text-gray-300 hover:border-brand-500 hover:text-brand-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              {step.cta && (
                <Link
                  to={step.path}
                  className="tap-target rounded-lg border border-gray-600 px-3 py-2 text-sm text-gray-300 hover:border-brand-500 hover:text-brand-400"
                >
                  {step.cta}
                </Link>
              )}
              <button
                type="button"
                onClick={nextStep}
                disabled={currentStep === steps.length - 1}
                className="tap-target rounded-lg border border-gray-600 px-3 py-2 text-sm text-gray-300 hover:border-brand-500 hover:text-brand-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
