import React, { useEffect, useRef, useState } from 'react';
import Live2DFrame, { Live2DHandle } from './Live2DFrame';
interface Props { paused?: boolean; onOpenSkin: () => void }

const YuCompanion: React.FC<Props> = ({ paused = false, onOpenSkin }) => {
  const [expanded, setExpanded] = useState(() => {
    try {
      const saved = localStorage.getItem('huaike_yu_companion');
      if (saved === 'open' || saved === 'closed') return saved === 'open';
    } catch { /* The companion also works without storage. */ }
    return window.matchMedia('(min-width: 768px)').matches;
  });
  const [userPaused, setUserPaused] = useState(false);
  const [animations, setAnimations] = useState<string[]>([]);
  const [animation, setAnimation] = useState('Relax');
  const stage = useRef<Live2DHandle>(null);
  useEffect(() => {
    setAnimations([]);
    setAnimation('Relax');
    try { localStorage.setItem('huaike_yu_companion', expanded ? 'open' : 'closed'); } catch { /* Storage is optional. */ }
  }, [expanded]);
  const play = (name: string) => { setUserPaused(false); stage.current?.play(name); };

  return <aside aria-label="Yu companion" className="fixed left-3 sm:left-4 bottom-5 z-30 pointer-events-none">
    {expanded ? <div className="w-[232px] sm:w-[254px] pointer-events-auto">
      <div className="flex justify-end items-center px-3">
        <button onClick={() => setExpanded(false)} aria-label="Hide Yu companion" title="Hide Yu companion" className="w-8 h-8 rounded-full bg-white/95 dark:bg-slate-800 shadow-sm text-slate-500 dark:text-slate-200 text-lg">×</button>
      </div>
      <Live2DFrame ref={stage} model="chibi" className="h-[205px] sm:h-[224px] drop-shadow-lg" paused={paused || userPaused}
        onReady={setAnimations} onAnimation={setAnimation} onClose={() => setExpanded(false)} />
      <div className="flex items-center justify-center gap-1.5 bg-white/95 dark:bg-slate-800/95 border border-stone-200/80 dark:border-slate-700 rounded-2xl p-2 shadow-lg backdrop-blur-sm">
        <label className="min-w-0 flex-1"><span className="sr-only">Yu companion action</span>
          <select value={animation} onChange={event => play(event.target.value)} disabled={!animations.length} className="w-full text-xs bg-stone-100 dark:bg-slate-700 rounded-xl px-2 py-2 cursor-pointer">
            {(animations.length ? animations : ['Relax']).map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>
        <button onClick={() => setUserPaused(value => !value)} disabled={!animations.length} aria-label={userPaused ? 'Resume Yu companion' : 'Pause Yu companion'} title={userPaused ? 'Resume' : 'Pause'} className="w-8 h-8 rounded-xl hover:bg-violet-50 dark:hover:bg-slate-700 text-xs font-bold disabled:opacity-40">{userPaused ? '▶' : 'Ⅱ'}</button>
        <button onClick={onOpenSkin} title="View Yu XII skin" aria-label="View Yu XII skin" className="rounded-xl bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-200 px-2.5 py-2 text-xs font-bold">Skin ↗</button>
      </div>
    </div> : <button onClick={() => setExpanded(true)} aria-label="Show Yu companion" className="pointer-events-auto flex items-center gap-2 rounded-full border border-stone-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 px-3.5 py-3 shadow-lg text-xs font-bold hover:bg-violet-50 dark:hover:bg-slate-700"><span aria-hidden="true">🌸</span> Yu</button>}
  </aside>;
};
export default YuCompanion;
