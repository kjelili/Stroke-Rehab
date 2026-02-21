import React from 'react';
import { Composition } from 'remotion';
import { NeuroRecoverAdvert } from './NeuroRecoverAdvert';

const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;
const DURATION_SEC = 180; // 3 minutes
const DURATION_FRAMES = DURATION_SEC * FPS;

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="NeuroRecoverAdvert"
        component={NeuroRecoverAdvert}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
    </>
  );
};
