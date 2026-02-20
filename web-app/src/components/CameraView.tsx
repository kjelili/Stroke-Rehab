import { useEffect, useRef, useState } from 'react';

interface CameraViewProps {
  onStream?: (stream: MediaStream) => void;
  onVideoReady?: (video: HTMLVideoElement | null) => void;
  className?: string;
  mirrored?: boolean;
  /** Rendered on top of the video (e.g. bubbles overlay). Same coordinate space as video (0–1). */
  children?: React.ReactNode;
}

/** Play interrupted by unmount or new load is expected; don't show as user error. */
function isPlayInterruptedError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return (
    msg.includes('interrupt') ||
    msg.includes('removed from the document') ||
    msg.includes('new load request')
  );
}

export function CameraView({ onStream, onVideoReady, className = '', mirrored = true, children }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const onReadyRef = useRef(onVideoReady);
  const onStreamRef = useRef(onStream);
  onReadyRef.current = onVideoReady;
  onStreamRef.current = onStream;

  useEffect(() => {
    let s: MediaStream | null = null;
    let cancelled = false;
    const video = videoRef.current;
    if (!video) return;

    const start = async () => {
      try {
        setError(null);
        setLoading(true);
        s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
        if (cancelled || !videoRef.current) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        video.srcObject = s;
        onStreamRef.current?.(s);
        await video.play();
        if (cancelled) return;
        onReadyRef.current?.(video);
      } catch (e) {
        if (cancelled) return;
        if (isPlayInterruptedError(e)) return;
        const msg = e instanceof Error ? e.message : 'Camera access failed';
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    start();
    return () => {
      cancelled = true;
      s?.getTracks().forEach((t) => t.stop());
      s = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      onReadyRef.current?.(null);
    };
  }, []);

  if (error) {
    return (
      <div className={`rounded-xl bg-surface-muted border border-gray-700 p-6 text-center ${className}`}>
        <p className="text-red-400 text-sm mb-2">Camera error</p>
        <p className="text-gray-400 text-sm">{error}</p>
        <p className="text-gray-500 text-xs mt-2">Use touch or mouse as fallback.</p>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden bg-black ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-elevated">
          <span className="text-gray-400 text-sm">Starting camera…</span>
        </div>
      )}
      <video
        ref={videoRef}
        playsInline
        muted
        className={`w-full h-full object-cover ${mirrored ? 'scale-x-[-1]' : ''} ${loading ? 'invisible' : ''}`}
        style={{ maxHeight: '50vh' }}
      />
      {children != null && <div className="absolute inset-0">{children}</div>}
    </div>
  );
}

export function useVideoRef() {
  const ref = useRef<HTMLVideoElement | null>(null);
  return ref;
}
