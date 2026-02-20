import { Composition } from 'remotion';
import { NeuroRecoverDemo } from './NeuroRecoverDemo';
import { NeuroRecoverAdvert } from './NeuroRecoverAdvert';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="NeuroRecoverDemo"
        component={NeuroRecoverDemo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="NeuroRecoverAdvert"
        component={NeuroRecoverAdvert}
        durationInFrames={720}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};
