import React, { useEffect, useState } from 'react';
import Live2DFrame from './Live2DFrame';

interface Props { paused: boolean }

const YuSkinBackground: React.FC<Props> = ({ paused }) => {
  const [autoAnimate, setAutoAnimate] = useState(() => window.matchMedia('(min-width: 768px)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setAutoAnimate(desktop.matches && !motion.matches);
    desktop.addEventListener('change', update);
    motion.addEventListener('change', update);
    return () => { desktop.removeEventListener('change', update); motion.removeEventListener('change', update); };
  }, []);
  useEffect(() => {
    if (!autoAnimate) return;
    // Let the profile paint before requesting the larger decorative model.
    if ('requestIdleCallback' in window) {
      const task = window.requestIdleCallback(() => setMounted(true), { timeout: 1500 });
      return () => window.cancelIdleCallback(task);
    }
    const task = setTimeout(() => setMounted(true), 400);
    return () => clearTimeout(task);
  }, [autoAnimate]);

  return <div className="yu-skin-wallpaper" aria-hidden="true" inert>
      <img src={`${import.meta.env.BASE_URL}live2d/yu-xii-background.webp`} alt="" className={`yu-wallpaper-poster ${ready ? 'yu-wallpaper-poster-hidden' : ''}`} fetchPriority="low" />
      {mounted && <Live2DFrame model="portrait" decorative className="h-full w-full" paused={paused || !autoAnimate}
        onReady={() => setReady(true)} onError={() => setReady(false)} />}
    </div>;
};
export default YuSkinBackground;
