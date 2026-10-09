import React, { useState } from 'react';
import { EMAIL_DISPLAY, PROFILE } from '../constants';

interface ContactFormProps { onClose: () => void; }

const ContactForm: React.FC<ContactFormProps> = ({ onClose }) => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [opened, setOpened] = useState(false);
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const subject = `Portfolio contact from ${form.name}`;
    const body = `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`;
    window.location.href = `mailto:${PROFILE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-slate-600 dark:text-slate-300">Get in touch about research, collaboration, or professional opportunities.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="text-sm font-semibold">Your name<input required autoComplete="name" name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-2 w-full rounded-xl px-4 py-3 border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 font-normal" /></label>
        <label className="text-sm font-semibold">Your email<input required type="email" autoComplete="email" name="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-2 w-full rounded-xl px-4 py-3 border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 font-normal" /></label>
      </div>
      <label className="block text-sm font-semibold">Message<textarea required name="message" rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="mt-2 w-full rounded-xl px-4 py-3 border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 resize-y font-normal" /></label>
      <p className="text-xs text-slate-500 dark:text-slate-400">This opens your email app with a draft. Send the email there to complete your message.</p>
      {opened && <p role="status" className="text-sm text-violet-700 dark:text-violet-300">Email draft requested. If your email app did not open, contact <a href={`mailto:${PROFILE.email}`} className="underline break-all">{EMAIL_DISPLAY}</a> directly.</p>}
      <div className="flex flex-wrap gap-3">
        <button type="submit" className="rounded-full bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 px-5 py-3 text-sm font-bold">Open Email Draft ↗</button>
        <button type="button" onClick={onClose} className="px-5 py-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Cancel</button>
      </div>
    </form>
  );
};

export default ContactForm;
