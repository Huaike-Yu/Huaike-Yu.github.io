import React, { useEffect, useRef, useState } from 'react';
import Live2DFrame, { Live2DHandle } from './Live2DFrame';
interface Props { open: boolean; onClose: () => void }

const YuSkinShowcase: React.FC<Props> = ({ open, onClose }) => {
  const dialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<Live2DHandle>(null);
  const [animations, setAnimations] = useState<string[]>([]);
  const [animation, setAnimation] = useState('Idle');
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!open || !dialog.current) return;
    const element = dialog.current;
    element.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setPaused(false);
    setAnimations([]);
    return () => { element.close(); document.body.style.overflow = overflow; };
  }, [open]);
  const play = (name: string) => { setPaused(false); stage.current?.play(name); };

  return <>
    {open && <dialog ref={dialog} aria-labelledby="yu-skin-title" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}
      className="portfolio-dialog yu-skin-dialog w-[calc(100%-1.5rem)] max-w-4xl max-h-[94dvh] m-auto p-0 border-0 rounded-3xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xl">
      <div className="flex items-start justify-between gap-3 px-5 sm:px-7 pt-5 pb-3">
        <div><p className="text-[10px] uppercase tracking-[0.18em] text-rose-500 dark:text-rose-300 font-bold mb-1">Arknights · Animated artwork</p><h2 id="yu-skin-title" className="font-display text-lg sm:text-2xl font-bold">余 · 0011制造 / XII</h2></div>
        <button autoFocus onClick={onClose} aria-label="Close Yu skin artwork" className="shrink-0 w-9 h-9 rounded-full bg-stone-100 dark:bg-slate-800 text-xl hover:bg-stone-200 dark:hover:bg-slate-700">×</button>
      </div>
      <div className="mx-3 sm:mx-5 rounded-2xl yu-artwork-background overflow-hidden">
        <Live2DFrame ref={stage} model="portrait" className="yu-portrait-stage" paused={paused} onReady={setAnimations} onAnimation={setAnimation} onClose={onClose} />
      </div>
      <div className="flex flex-wrap justify-center items-center gap-2 px-4 pt-4 pb-2" role="group" aria-label="Yu skin animations">
        {['Idle', 'Interact', 'Special'].map(name => <button key={name} onClick={() => play(name)} disabled={!animations.includes(name)} aria-pressed={animation === name} className={`rounded-full px-4 py-2 text-xs font-bold transition-colors disabled:opacity-40 ${animation === name ? 'bg-violet-600 text-white dark:bg-violet-300 dark:text-slate-900' : 'bg-stone-100 dark:bg-slate-800 hover:bg-violet-100 dark:hover:bg-slate-700'}`}>{name}</button>)}
        <button onClick={() => setPaused(value => !value)} disabled={!animations.length} aria-label={paused ? 'Resume skin animation' : 'Pause skin animation'} className="rounded-full px-4 py-2 text-xs font-bold bg-stone-100 dark:bg-slate-800 disabled:opacity-40">{paused ? '▶ Resume' : 'Ⅱ Pause'}</button>
      </div>
      <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 px-5 pb-2">Tap the artwork to interact · Esc to close</p>
      <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 px-5 pb-5">Character & artwork © Hypergryph · <a href="https://github.com/SHUAXINDIARY/ArknightsLive2d-Web" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-violet-600">Viewer source</a> · <a href="https://github.com/isHarryh/Ark-Models" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-violet-600">Model source</a></p>
    </dialog>}
  </>;
};
export default YuSkinShowcase;
