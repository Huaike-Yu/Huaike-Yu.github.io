import React, { useEffect, useRef, useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { CV_URL, EMAIL_DISPLAY, PIN_LABELS, PORTFOLIO_PINS, PROFILE } from './constants';
import { PinData, PinType, StickerData } from './types';
import Pin from './components/Pin';
import ChatWidget from './components/ChatWidget';
import ContactForm from './components/ContactForm';
import Sticker from './components/Sticker';
import Background from './components/Background';
import YuCompanion from './components/YuCompanion';
import YuSkinShowcase from './components/YuSkinShowcase';
import YuSkinBackground from './components/YuSkinBackground';

const STICKERS: StickerData[] = [
  { id: '1', emoji: '🌸', top: '13%', left: '4%', rotation: -10 },
  { id: '2', emoji: '✨', top: '25%', left: '93%', rotation: 15 },
  { id: '3', emoji: '🧩', top: '61%', left: '2%', rotation: -5 },
  { id: '4', emoji: '🔬', top: '82%', left: '94%', rotation: 10 },
];
type Theme = 'light' | 'dark' | 'system';
type Filter = PinType | 'ALL' | 'SAVED';

const App: React.FC = () => {
  const [selectedPin, setSelectedPin] = useState<PinData | null>(null);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');
  const [themeMode, setThemeMode] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('theme');
      return saved === 'light' || saved === 'dark' ? saved : 'system';
    } catch { return 'system'; }
  });
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');
  const [savedPinIds, setSavedPinIds] = useState<string[]>(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem('huaike_saved_pins') || '[]');
      return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === 'string') : [];
    } catch { return []; }
  });
  const [copyStatus, setCopyStatus] = useState('');
  const [skinOpen, setSkinOpen] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const next = themeMode === 'system' ? (media.matches ? 'dark' : 'light') : themeMode;
      setEffectiveTheme(next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      document.documentElement.style.colorScheme = next;
    };
    apply();
    try { localStorage.setItem('theme', themeMode); } catch { /* Storage is optional. */ }
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [themeMode]);

  useEffect(() => {
    try { localStorage.setItem('huaike_saved_pins', JSON.stringify(savedPinIds)); } catch { /* Storage is optional. */ }
  }, [savedPinIds]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!selectedPin || !dialog) return;
    dialog.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
    };
  }, [selectedPin]);

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  const toggleSave = (id: string) => {
    setSavedPinIds(ids => ids.includes(id) ? ids.filter(saved => saved !== id) : [...ids, id]);
  };
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopyStatus('Email copied!');
    } catch { setCopyStatus('Clipboard unavailable. Use the email link to contact me.'); }
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyStatus(''), 3000);
  };
  const filteredPins = PORTFOLIO_PINS.filter(pin => {
    const matchesCategory = filter === 'ALL' || (filter === 'SAVED' ? savedPinIds.includes(pin.id) : pin.type === filter);
    const skillTerms = pin.type === PinType.SKILL ? PROFILE.skills.flatMap(skill => [skill.category, ...skill.items]) : [];
    const searchable = [pin.title, pin.subtitle, pin.description, pin.period, pin.status, ...(pin.tags || []), ...(pin.authors || []), ...(pin.details || []), ...skillTerms].join(' ').toLowerCase();
    return matchesCategory && searchable.includes(search.trim().toLowerCase());
  });
  const contactPin = PORTFOLIO_PINS.find(pin => pin.id === 'contact')!;

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen relative overflow-x-hidden pb-12 text-slate-800 dark:text-slate-100 transition-colors duration-300">
        <Background theme={effectiveTheme} />
        <YuSkinBackground paused={skinOpen || Boolean(selectedPin)} />
        <a href="#portfolio" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:rounded-xl">Skip to portfolio</a>
        <div className="hidden lg:block" aria-hidden="true">
          {STICKERS.map((sticker, i) => <Sticker key={sticker.id} {...sticker} delay={i * 0.2} />)}
        </div>

        <nav aria-label="Main navigation" className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/85 backdrop-blur-md border-b border-stone-200/60 dark:border-slate-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 py-4">
            <a href="#" className="flex items-center gap-3 min-w-0" aria-label="Huaike Yu home">
              <span className="hidden sm:flex w-10 h-10 shrink-0 rounded-2xl bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 items-center justify-center font-bold text-sm">{PROFILE.initials}</span>
              <span className="font-display font-bold text-lg sm:text-xl whitespace-nowrap">{PROFILE.name}<span className="hidden lg:inline text-sm font-normal text-slate-500 dark:text-slate-400 ml-3">Research & Portfolio</span></span>
            </a>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center bg-stone-100 dark:bg-slate-800 rounded-full p-1" role="group" aria-label="Color theme">
                {(['light', 'dark', 'system'] as Theme[]).map((theme, i) => (
                  <button key={theme} onClick={() => setThemeMode(theme)} aria-label={`${theme.charAt(0).toUpperCase() + theme.slice(1)} theme`} aria-pressed={themeMode === theme} title={`${theme} theme`} className={`p-1.5 sm:p-2 rounded-full text-xs sm:text-sm transition-colors ${themeMode === theme ? 'bg-white dark:bg-slate-600 shadow-sm' : 'opacity-60 hover:opacity-100'}`}>{['☀️', '🌙', '🖥️'][i]}</button>
                ))}
              </div>
              <button onClick={() => setSelectedPin(contactPin)} className="rounded-full bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-bold text-sm px-3 sm:px-5 py-2.5 hover:opacity-90">Contact<span className="hidden sm:inline"> Me</span></button>
            </div>
          </div>
        </nav>

        <header className="max-w-3xl mx-auto text-center px-5 pt-12 sm:pt-16 pb-12 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6">
              <div className="w-full h-full rounded-[36px] border-4 border-white dark:border-slate-700 shadow-lg bg-gradient-to-br from-cute-blue via-cute-purple to-cute-pink dark:from-blue-900 dark:via-purple-900 dark:to-rose-900 flex items-center justify-center text-4xl font-display font-extrabold text-slate-700 dark:text-white">{PROFILE.initials}</div>
              <span aria-hidden="true" className="absolute -bottom-2 -right-3 rounded-2xl bg-white dark:bg-slate-800 p-2 shadow-sm text-2xl">🌱</span>
            </div>
            <p className="uppercase tracking-[0.2em] text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">Research · Technology · Curiosity</p>
            <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight mb-4">Huaike <span className="text-violet-600 dark:text-violet-300">Yu</span></h1>
            <p className="text-lg font-semibold mb-1">{PROFILE.role}</p>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">{PROFILE.institution}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">Research guidance: <span className="font-semibold text-slate-700 dark:text-slate-200">{PROFILE.guidance}</span></p>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto mt-6">{PROFILE.introduction}</p>
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {PROFILE.researchInterests.map(interest => <span key={interest} className="px-3 py-1.5 bg-white/70 dark:bg-slate-800/80 border border-stone-200/70 dark:border-slate-700 rounded-full text-xs font-semibold">{interest}</span>)}
            </div>
            <div className="flex flex-wrap justify-center items-center gap-3 mt-7">
              <div className="flex items-center gap-2 rounded-full bg-white/80 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 px-4 py-2.5 shadow-sm max-w-full">
                <a href={`mailto:${PROFILE.email}`} className="text-xs sm:text-sm font-semibold break-all hover:text-violet-600 dark:hover:text-violet-300">{EMAIL_DISPLAY}</a>
                <button onClick={copyEmail} aria-label="Copy email address" title="Copy email address" className="p-1 text-slate-500 dark:text-slate-400 hover:text-violet-600">⧉</button>
              </div>
              <a href={CV_URL} download="Huaike_Yu_CV.pdf" className="rounded-full px-5 py-3 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-sm font-bold hover:opacity-90">Download CV ↓</a>
            </div>
            <p role="status" className="h-5 text-xs text-violet-700 dark:text-violet-300 mt-2">{copyStatus}</p>
          </motion.div>
        </header>

        <YuSkinShowcase open={skinOpen} onClose={() => setSkinOpen(false)} />

        <main id="portfolio" className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl font-display font-bold">My Portfolio Board <span aria-hidden="true">✦</span></h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{PROFILE.publications.length} papers & preprints · Education, research, and experience</p>
            </div>
            <label className="relative block sm:w-64">
              <span className="sr-only">Search portfolio</span>
              <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search my portfolio…" className="w-full rounded-full bg-white/85 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 px-4 py-2.5 text-sm placeholder:text-slate-500" />
            </label>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-3" role="group" aria-label="Filter portfolio">
            {(['ALL', ...Object.values(PinType), 'SAVED'] as Filter[]).map(category => (
              <button key={category} onClick={() => setFilter(category)} aria-pressed={filter === category} className={`shrink-0 px-4 py-2.5 rounded-full text-sm font-bold transition-colors border ${filter === category ? 'bg-slate-800 text-white border-slate-800 dark:bg-slate-200 dark:text-slate-900 dark:border-slate-200' : 'bg-white/75 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-stone-200 dark:border-slate-700 hover:border-violet-300'}`}>{category === 'ALL' ? 'View All' : category === 'SAVED' ? `Saved (${savedPinIds.length})` : PIN_LABELS[category]}</button>
            ))}
          </div>
          <p className="sr-only" role="status">{filteredPins.length} portfolio entries shown</p>
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5">
            {filteredPins.map(pin => <Pin key={pin.id} data={pin} onClick={setSelectedPin} isSaved={savedPinIds.includes(pin.id)} onToggleSave={() => toggleSave(pin.id)} />)}
          </div>
          {filteredPins.length === 0 && <div className="text-center py-20 text-slate-500 dark:text-slate-400"><p className="text-4xl mb-4" aria-hidden="true">🌱</p><p>{filter === 'SAVED' && !search ? 'Save a card to keep it on your board.' : 'No entries match your search.'}</p><button onClick={() => { setSearch(''); setFilter('ALL'); }} className="mt-5 underline font-semibold">View all entries</button></div>}
        </main>

        <footer className="max-w-7xl mx-auto px-6 pt-12 relative z-10 text-center text-xs text-slate-500 dark:text-slate-400">
          <p>{PROFILE.name} · Research & Portfolio</p>
          <p className="mt-2">Yu · XII artwork © Hypergryph · <a href="https://github.com/isHarryh/Ark-Models" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Model credits</a></p>
          <a href={`mailto:${PROFILE.email}`} className="inline-block mt-2 hover:text-violet-600 dark:hover:text-violet-300">{EMAIL_DISPLAY}</a>
        </footer>

        {selectedPin && <dialog ref={dialogRef} aria-labelledby="detail-title" onCancel={() => setSelectedPin(null)} onClick={e => { if (e.target === e.currentTarget) setSelectedPin(null); }} className="portfolio-dialog w-[calc(100%-2rem)] max-w-3xl max-h-[90dvh] m-auto p-0 border-0 rounded-3xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xl">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-6 sm:p-10 relative">
            <button autoFocus onClick={() => setSelectedPin(null)} aria-label="Close details" className="absolute right-4 top-4 rounded-full bg-stone-100 dark:bg-slate-800 w-9 h-9 text-xl hover:bg-stone-200 dark:hover:bg-slate-700">×</button>
            <span aria-hidden="true" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950 text-3xl mb-5">{selectedPin.icon}</span>
            <p className="text-xs uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 mb-2">{PIN_LABELS[selectedPin.type]}{selectedPin.period ? ` · ${selectedPin.period}` : ''}</p>
            <h2 id="detail-title" className="font-display text-2xl sm:text-3xl leading-tight font-bold mb-4">{selectedPin.title}</h2>
            {selectedPin.subtitle && <p className="font-semibold text-slate-700 dark:text-slate-200 mb-3 break-words">{selectedPin.subtitle}</p>}
            {selectedPin.status && <span className="inline-block bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-xs font-bold px-3 py-1.5 rounded-full mb-4">{selectedPin.status}</span>}
            {selectedPin.type === PinType.CONTACT ? <ContactForm onClose={() => setSelectedPin(null)} /> : <>
              {selectedPin.authors && <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 mb-4">{selectedPin.authors.map((author, i) => <React.Fragment key={author}>{i > 0 ? ', ' : ''}{author === PROFILE.name ? <strong className="text-slate-800 dark:text-white">{author}</strong> : author}</React.Fragment>)}</p>}
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">{selectedPin.description}</p>
              {selectedPin.details && <ul className="space-y-3 mb-6 list-disc pl-5 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{selectedPin.details.map(detail => <li key={detail}>{detail}</li>)}</ul>}
              {selectedPin.note && <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 mb-6">{selectedPin.note}</p>}
              {selectedPin.type === PinType.SKILL && <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">{PROFILE.skills.map(skill => <div key={skill.category} className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800 border border-stone-100 dark:border-slate-700"><h3 className="font-bold mb-3 text-sm"><span aria-hidden="true">{skill.icon}</span> {skill.category}</h3><div className="flex flex-wrap gap-2">{skill.items.map(item => <span key={item} className="text-xs px-2 py-1.5 bg-white dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-200">{item}</span>)}</div></div>)}</div>}
              <div className="flex flex-wrap gap-2 mb-7">{selectedPin.tags?.map(tag => <span key={tag} className="text-xs font-semibold rounded-lg px-3 py-1.5 bg-stone-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{tag}</span>)}</div>
              {selectedPin.link && <a href={selectedPin.link} target={selectedPin.type === PinType.RESUME ? undefined : '_blank'} rel={selectedPin.type === PinType.RESUME ? undefined : 'noopener noreferrer'} download={selectedPin.type === PinType.RESUME ? 'Huaike_Yu_CV.pdf' : undefined} className="inline-flex items-center gap-2 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 rounded-full px-6 py-3 text-sm font-bold hover:opacity-90">{selectedPin.type === PinType.RESUME ? 'Download CV ↓' : 'Read Paper ↗'}</a>}
            </>}
          </motion.div>
        </dialog>}
        <ChatWidget />
        <YuCompanion paused={skinOpen || Boolean(selectedPin)} onOpenSkin={() => setSkinOpen(true)} />
      </div>
    </MotionConfig>
  );
};

export default App;
