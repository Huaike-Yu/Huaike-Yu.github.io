import React from 'react';
import { motion } from 'framer-motion';
import { PinData } from '../types';
import { PIN_LABELS, PROFILE } from '../constants';

interface PinProps {
  data: PinData;
  onClick: (data: PinData) => void;
  isSaved: boolean;
  onToggleSave: () => void;
}

const Pin: React.FC<PinProps> = ({ data, onClick, isSaved, onToggleSave }) => {
  const inverse = data.color?.includes('text-white');
  return (
    <motion.article initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }} className={`break-inside-avoid mb-5 rounded-3xl border border-black/5 dark:border-white/10 shadow-sm hover:shadow-lg transition-shadow relative group ${data.color}`}>
      <button onClick={() => onClick(data)} aria-label={`View ${data.title}`} className="block w-full text-left p-6 rounded-3xl">
        <span className="flex items-center justify-between pr-16 mb-5">
          <span aria-hidden="true" className="text-3xl">{data.icon}</span>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${inverse ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>{PIN_LABELS[data.type]}</span>
        </span>
        {data.period && <span className={`block text-xs font-semibold mb-2 ${inverse ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'}`}>{data.period}</span>}
        <span role="heading" aria-level={3} className={`block font-display font-bold text-xl mb-3 leading-snug ${inverse ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{data.title}</span>
        {data.subtitle && <span className={`block text-sm font-semibold leading-relaxed mb-3 break-words ${inverse ? 'text-slate-200' : 'text-slate-700 dark:text-slate-200'}`}>{data.subtitle}</span>}
        {data.authors && <span className="block text-xs leading-relaxed text-slate-600 dark:text-slate-300 mb-3">{data.authors.map((author, i) => <React.Fragment key={author}>{i > 0 ? ', ' : ''}{author === PROFILE.name ? <strong className="text-slate-800 dark:text-white">{author}</strong> : author}</React.Fragment>)}</span>}
        <span className={`block text-sm leading-relaxed ${inverse ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>{data.description}</span>
        {data.status && <span className={`inline-block mt-3 text-[11px] font-bold rounded-full px-2.5 py-1 ${inverse ? 'bg-white/15 text-white' : 'bg-white/60 text-slate-700 dark:bg-white/10 dark:text-slate-200'}`}>{data.status}</span>}
        <span className="flex flex-wrap gap-1.5 mt-4">{data.tags?.map(tag => <span key={tag} className={`text-[11px] rounded-lg px-2 py-1 font-semibold ${inverse ? 'bg-white/10 text-slate-200' : 'bg-black/5 text-slate-600 dark:bg-white/10 dark:text-slate-200'}`}>{tag}</span>)}</span>
        <span className={`block text-xs font-bold mt-5 ${inverse ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'}`}>View details <span aria-hidden="true">↗</span></span>
      </button>
      <button onClick={onToggleSave} aria-label={`${isSaved ? 'Unsave' : 'Save'} ${data.title}`} aria-pressed={isSaved} title={isSaved ? 'Remove from saved' : 'Save this card'} className={`absolute right-4 top-5 text-xs rounded-full px-3 py-2 font-bold transition-colors ${isSaved ? 'bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900' : 'bg-white/75 text-slate-600 hover:bg-white dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20'}`}>{isSaved ? 'Saved ✓' : 'Save'}</button>
    </motion.article>
  );
};

export default Pin;
