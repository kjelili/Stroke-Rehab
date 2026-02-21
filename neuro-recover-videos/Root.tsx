/**
 * Root.tsx
 * ========
 * Register both video compositions for Remotion Studio and rendering
 */
import React from 'react';
import { Composition } from 'remotion';
import { LiveDemo } from './LiveDemo/LiveDemo';
import { AdvertDemo } from './AdvertDemo/AdvertDemo';
import { VIDEO_CONFIG } from './components/tokens';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ── Live Technical Demo ────────────────────────────────────────── */}
      <Composition
        id="LiveDemo"
        component={LiveDemo}
        durationInFrames={7200}  // 7200 = 4 minutes @ 30fps
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
        defaultProps={{}}
      />

      {/* ── Advertisement / Marketing Demo ────────────────────────────── */}
      <Composition
        id="AdvertDemo"
        component={AdvertDemo}
        durationInFrames={VIDEO_CONFIG.durationFrames}  // 5400 = 3 minutes @ 30fps
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
        defaultProps={{}}
      />
    </>
  );
};
