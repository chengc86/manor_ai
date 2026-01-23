import { Composition } from 'remotion';
import { ManorAIPromo } from './compositions/ManorAIPromo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ManorAIPromo"
        component={ManorAIPromo}
        durationInFrames={450} // 15 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
