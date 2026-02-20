import { useCallback, useEffect, useRef, useState } from 'react';

export type VoiceKeyword = 'tired' | 'hard' | 'hurts' | null;

export interface UseVoiceKeywordsOptions {
  onKeyword: (keyword: VoiceKeyword) => void;
  /** Called with raw transcript when speech result is received (for MedGemma coaching/dysarthria). */
  onTranscript?: (transcript: string) => void;
}

export function useVoiceKeywords(options: UseVoiceKeywordsOptions | ((keyword: VoiceKeyword) => void)) {
  const onKeyword = typeof options === 'function' ? options : options.onKeyword;
  const onTranscript = typeof options === 'function' ? undefined : options.onTranscript;
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const start = useCallback(() => {
    const win = window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition };
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setError('Speech recognition not supported');
      return;
    }
    try {
      setError(null);
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((r: SpeechRecognitionResult) => r[0].transcript)
          .join(' ')
          .toLowerCase();
        onTranscript?.(transcript);
        if (/\b(tired|rest|break)\b/.test(transcript)) onKeyword('tired');
        else if (/\b(hard|difficult)\b/.test(transcript)) onKeyword('hard');
        else if (/\b(hurts?|pain)\b/.test(transcript)) onKeyword('hurts');
      };
      recognition.onerror = () => setListening(false);
      recognition.onend = () => setListening(false);
      recognition.start();
      recognitionRef.current = recognition;
      setListening(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start voice');
    }
  }, [onKeyword, onTranscript]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  return { listening, error, start, stop };
}
