import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/** Total duration of the 3-minute live presentation (seconds). */
export const PRESENTATION_DURATION_SEC = 180;

/** Segment boundaries in seconds: 0–20, 20–60, 60–100, 100–140, 140–180. */
const SEGMENT_ENDS = [20, 60, 100, 140, 180];

function stepFromElapsed(elapsed: number): number {
  for (let i = 0; i < SEGMENT_ENDS.length; i++) {
    if (elapsed < SEGMENT_ENDS[i]) return i;
  }
  return SEGMENT_ENDS.length - 1;
}

export type DemoStepItem = {
  title: string;
  script: string;
  overlay?: string;
  time: string;
  path: string;
  cta: string | null;
};

export const DEMO_STEPS: DemoStepItem[] = [
  {
    title: 'Real-world problem',
    script: 'Bored patient doing repetitive exercises.',
    time: '0:00–0:20',
    path: '/app',
    cta: 'Dashboard',
  },
  {
    title: 'Live demonstration',
    script: 'Hand tracking, bubble pop interaction, real-time ROM metric.',
    time: '0:20–1:00',
    path: '/app/bubbles',
    cta: 'Open Bubbles',
  },
  {
    title: 'MedGemma inference (offline)',
    script: 'Raw metrics → structured clinical summary.',
    overlay: 'Running fully offline using open-weight MedGemma',
    time: '1:00–1:40',
    path: '/app/progress',
    cta: 'Progress & Export PDF',
  },
  {
    title: 'Clinician dashboard',
    script: 'Recovery curve, flagged regression, FHIR export.',
    time: '1:40–2:20',
    path: '/app/clinician',
    cta: 'Clinician view',
  },
  {
    title: 'Close',
    script: 'Neuro-Recover Edge brings AI-powered neurorehabilitation to any clinical environment, without reliance on centralized infrastructure.',
    time: '2:20–3:00',
    path: '/app',
    cta: null,
  },
];

type DemoContextValue = {
  isDemoMode: boolean;
  currentStep: number;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  steps: DemoStepItem[];
  /** True when the 3-min timed presentation is running. */
  presentationActive: boolean;
  /** Elapsed seconds (0–180) during presentation. */
  presentationElapsed: number;
  /** Start the 3-minute live presentation; steps and navigation advance by time. */
  startPresentation: () => void;
  /** Stop the timed presentation (manual control resumes). */
  stopPresentation: () => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [presentationStartTime, setPresentationStartTime] = useState<number | null>(null);
  const [presentationElapsed, setPresentationElapsed] = useState(0);
  const location = useLocation();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isDemoMode = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const fromUrl = /[?&]demo=1/.test(location.search) || /[?&]demo=1/.test(window.location.search);
    if (fromUrl) try { sessionStorage.setItem('neuro-recover-demo', '1'); } catch { /* ignore */ }
    try { return fromUrl || sessionStorage.getItem('neuro-recover-demo') === '1'; } catch { return fromUrl; }
  }, [location.search]);

  useEffect(() => {
    if (presentationStartTime === null) return;
    const tick = () => {
      const elapsed = Math.min((Date.now() - presentationStartTime) / 1000, PRESENTATION_DURATION_SEC);
      setPresentationElapsed(elapsed);
      const step = stepFromElapsed(elapsed);
      setCurrentStep(step);
      if (elapsed >= PRESENTATION_DURATION_SEC && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    tick();
    intervalRef.current = setInterval(tick, 500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [presentationStartTime]);

  const startPresentation = useCallback(() => {
    setPresentationStartTime(Date.now());
    setCurrentStep(0);
    setPresentationElapsed(0);
  }, []);

  const stopPresentation = useCallback(() => {
    setPresentationStartTime(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const setStep = useCallback((step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, DEMO_STEPS.length - 1)));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, DEMO_STEPS.length - 1));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const value = useMemo<DemoContextValue>(
    () => ({
      isDemoMode,
      currentStep,
      setStep,
      nextStep,
      prevStep,
      steps: DEMO_STEPS,
      presentationActive: presentationStartTime !== null,
      presentationElapsed,
      startPresentation,
      stopPresentation,
    }),
    [isDemoMode, currentStep, setStep, nextStep, prevStep, presentationStartTime, presentationElapsed, startPresentation, stopPresentation]
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  return useContext(DemoContext);
}
