import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { generateChatResponse, HAS_AI_KEY } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'model', text: 'Hi! I’m Huaike’s profile guide. Ask about research, publications, education, experience, or skills. ✨', timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest' }); }, [messages, isTyping]);

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || busyRef.current) return;
    busyRef.current = true;
    setIsTyping(true);
    setInput('');
    setMessages(previous => [...previous, { id: crypto.randomUUID(), role: 'user', text: question, timestamp: new Date() }]);
    try {
      const answer = await generateChatResponse(question);
      setMessages(previous => [...previous, { id: crypto.randomUUID(), role: 'model', text: answer, timestamp: new Date() }]);
    } finally {
      busyRef.current = false;
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };
  const close = () => { setIsOpen(false); toggleRef.current?.focus(); };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end" onKeyDown={e => { if (e.key === 'Escape') close(); }}>
      <AnimatePresence>
        {isOpen && <motion.section id="profile-guide" aria-label="Huaike’s profile guide" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} className="mb-3 w-[min(24rem,calc(100vw-2rem))] h-[min(500px,75dvh)] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-700 flex flex-col overflow-hidden">
          <div className="p-4 bg-cute-purple/35 dark:bg-purple-950/70 flex items-center justify-between">
            <div><h2 className="font-bold text-sm">Huaike’s Profile Guide</h2><p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{HAS_AI_KEY ? 'AI assistant' : 'Explore my background'}</p></div>
            <button onClick={close} aria-label="Close profile guide" className="w-8 h-8 rounded-full text-xl text-slate-500 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10">×</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3" role="log" aria-live="polite" aria-relevant="additions">
            {messages.map(message => <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><p className={`max-w-[92%] p-3 text-sm leading-relaxed rounded-2xl whitespace-pre-wrap break-words ${message.role === 'user' ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900' : 'bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'}`}>{message.text}</p></div>)}
            {isTyping && <p role="status" className="text-xs text-slate-500">Preparing a response…</p>}
            <div ref={endRef} />
          </div>
          <form onSubmit={handleSend} className="p-3 border-t border-stone-200 dark:border-slate-800 flex gap-2">
            <input ref={inputRef} aria-label="Ask about Huaike" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about my research…" className="min-w-0 flex-1 rounded-full bg-stone-100 dark:bg-slate-800 px-4 py-2 text-sm" />
            <button type="submit" aria-label="Send question" disabled={!input.trim() || isTyping} className="w-10 h-10 rounded-full bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 disabled:opacity-40">↑</button>
          </form>
        </motion.section>}
      </AnimatePresence>
      <motion.button ref={toggleRef} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => isOpen ? close() : setIsOpen(true)} aria-label={isOpen ? 'Close profile guide' : 'Open profile guide'} aria-expanded={isOpen} aria-controls="profile-guide" className="rounded-full bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-600 p-4 shadow-lg text-2xl">{isOpen ? '×' : '✨'}</motion.button>
    </div>
  );
};

export default ChatWidget;
