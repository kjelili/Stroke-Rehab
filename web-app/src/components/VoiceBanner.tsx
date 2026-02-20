import { useCallback, useEffect, useState } from 'react';
import type { VoiceKeyword } from '../hooks/useVoiceKeywords';
import { useVoiceKeywords } from '../hooks/useVoiceKeywords';
import { fetchEmotionAwareCoaching, fetchDysarthriaAnalysis } from '../api/medgemma';

interface VoiceBannerProps {
  onSuggestBreak?: () => void;
  onSuggestEasier?: () => void;
}

export function VoiceBanner({ onSuggestBreak, onSuggestEasier }: VoiceBannerProps) {
  const [lastKeyword, setLastKeyword] = useState<VoiceKeyword>(null);
  const [lastTranscript, setLastTranscript] = useState<string>('');
  const [coachingMessage, setCoachingMessage] = useState<string | null>(null);
  const [dysarthriaAnalysis, setDysarthriaAnalysis] = useState<string | null>(null);

  const onKeyword = useCallback((keyword: VoiceKeyword) => {
    setLastKeyword(keyword);
  }, []);

  const onTranscript = useCallback((transcript: string) => {
    setLastTranscript(transcript);
  }, []);

  const { listening, error, start, stop } = useVoiceKeywords({ onKeyword, onTranscript });

  useEffect(() => {
    if (!lastKeyword || !lastTranscript.trim()) return;
    let cancelled = false;
    (async () => {
      const [message, analysis] = await Promise.all([
        fetchEmotionAwareCoaching(lastTranscript, {}),
        fetchDysarthriaAnalysis(lastTranscript),
      ]);
      if (!cancelled) {
        if (message) setCoachingMessage(message);
        if (analysis) setDysarthriaAnalysis(analysis);
      }
    })();
    return () => { cancelled = true; };
  }, [lastKeyword, lastTranscript]);

  const handleSuggestBreak = () => {
    setLastKeyword(null);
    setCoachingMessage(null);
    setDysarthriaAnalysis(null);
    onSuggestBreak?.();
  };

  const handleSuggestEasier = () => {
    setLastKeyword(null);
    setCoachingMessage(null);
    setDysarthriaAnalysis(null);
    onSuggestEasier?.();
  };

  const dismissPain = () => {
    setLastKeyword(null);
    setCoachingMessage(null);
    setDysarthriaAnalysis(null);
  };

  return (
    <div className="rounded-xl bg-surface-muted border border-gray-800 p-4 mb-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-gray-400">Voice: say &quot;I&apos;m tired&quot;, &quot;This is hard&quot;, or &quot;My hand hurts&quot;</span>
        {!listening ? (
          <button
            type="button"
            onClick={start}
            className="tap-target rounded-lg bg-brand-500/20 px-3 py-1.5 text-sm text-brand-400 hover:bg-brand-500/30"
          >
            Start listening
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            className="tap-target rounded-lg border border-gray-600 px-3 py-1.5 text-sm text-gray-300"
          >
            Stop
          </button>
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      {lastKeyword === 'tired' && (
        <div className="mt-3 p-3 rounded-lg bg-brand-500/10 border border-brand-500/30">
          {coachingMessage ? (
            <p className="text-sm text-brand-300 mb-2">{coachingMessage}</p>
          ) : (
            <p className="text-sm text-brand-300 mb-2">You said you&apos;re tired. Take a short break?</p>
          )}
          <button type="button" onClick={handleSuggestBreak} className="tap-target rounded-lg bg-brand-500 px-3 py-1.5 text-sm text-white">
            Yes, take a break
          </button>
          {dysarthriaAnalysis && (
            <div className="mt-2 pt-2 border-t border-brand-500/20">
              <p className="text-xs text-gray-400 font-medium mb-1">Linguistic pattern note (for clinician)</p>
              <p className="text-xs text-gray-500">{dysarthriaAnalysis}</p>
            </div>
          )}
        </div>
      )}
      {lastKeyword === 'hard' && (
        <div className="mt-3 p-3 rounded-lg bg-brand-500/10 border border-brand-500/30">
          {coachingMessage ? (
            <p className="text-sm text-brand-300 mb-2">{coachingMessage}</p>
          ) : (
            <p className="text-sm text-brand-300 mb-2">You said it&apos;s hard. Switch to easier mode?</p>
          )}
          <button type="button" onClick={handleSuggestEasier} className="tap-target rounded-lg bg-brand-500 px-3 py-1.5 text-sm text-white">
            Easier mode
          </button>
          {dysarthriaAnalysis && (
            <div className="mt-2 pt-2 border-t border-brand-500/20">
              <p className="text-xs text-gray-400 font-medium mb-1">Linguistic pattern note (for clinician)</p>
              <p className="text-xs text-gray-500">{dysarthriaAnalysis}</p>
            </div>
          )}
        </div>
      )}
      {lastKeyword === 'hurts' && (
        <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          {coachingMessage ? (
            <p className="text-sm text-amber-200 mb-2">{coachingMessage}</p>
          ) : (
            <p className="text-sm text-amber-200">You mentioned pain. Consider resting and trying again later.</p>
          )}
          <button type="button" onClick={dismissPain} className="tap-target rounded-lg border border-amber-500/50 px-3 py-1.5 text-sm text-amber-200 mt-2">
            Dismiss
          </button>
          {dysarthriaAnalysis && (
            <div className="mt-2 pt-2 border-t border-amber-500/20">
              <p className="text-xs text-gray-400 font-medium mb-1">Linguistic pattern note (for clinician)</p>
              <p className="text-xs text-gray-500">{dysarthriaAnalysis}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
