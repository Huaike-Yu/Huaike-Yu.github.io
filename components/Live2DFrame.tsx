import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

export type YuModel = 'chibi' | 'portrait';
export interface Live2DHandle { play: (animation: string) => void }
interface Props {
  model: YuModel;
  className?: string;
  paused?: boolean;
  decorative?: boolean;
  onReady?: (animations: string[]) => void;
  onAnimation?: (animation: string) => void;
  onClose?: () => void;
  onError?: (message: string) => void;
}
const CHANNEL = 'huaike-yu-stage';

const Live2DFrame = forwardRef<Live2DHandle, Props>(({ model, className = '', paused = false, decorative = false, ...callbacks }, ref) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(true);
  const post = (message: object) => frameRef.current?.contentWindow?.postMessage({ channel: CHANNEL, ...message }, window.location.origin);
  useImperativeHandle(ref, () => ({ play: animation => post({ type: 'action', animation }) }), []);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => setVisible(entries[0].isIntersecting));
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus(current => current === 'loading' ? 'error' : current);
      setError('The character could not be loaded. Please retry.');
      callbacksRef.current.onError?.('The character could not be loaded. Please retry.');
    }, 50000);
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow || event.data?.channel !== CHANNEL) return;
      if (event.data.type === 'ready' && Array.isArray(event.data.animations)) {
        clearTimeout(timer);
        setStatus('ready');
        callbacksRef.current.onReady?.(event.data.animations.filter((name: unknown): name is string => typeof name === 'string'));
      }
      if (event.data.type === 'animation' && typeof event.data.animation === 'string') callbacksRef.current.onAnimation?.(event.data.animation);
      if (event.data.type === 'error') {
        clearTimeout(timer);
        setStatus('error');
        setError(typeof event.data.message === 'string' ? event.data.message : 'The character could not be loaded.');
        callbacksRef.current.onError?.(typeof event.data.message === 'string' ? event.data.message : 'The character could not be loaded.');
      }
      if (event.data.type === 'close') callbacksRef.current.onClose?.();
    };
    window.addEventListener('message', receive);
    return () => { clearTimeout(timer); window.removeEventListener('message', receive); };
  }, [attempt, model]);
  useEffect(() => {
    if (status === 'ready') post({ type: 'pause', paused: paused || !visible });
  }, [paused, status, visible]);

  return <div ref={containerRef} className={`relative ${className}`} aria-busy={status === 'loading'} aria-hidden={decorative || undefined} inert={decorative}>
    <iframe key={attempt} ref={frameRef} src={`${import.meta.env.BASE_URL}live2d/embed.html?model=${model}${decorative ? '&background=1' : ''}`}
      title={decorative ? 'Yu XII animated background' : model === 'chibi' ? 'Interactive Yu chibi companion' : 'Yu XII animated skin artwork'}
      tabIndex={decorative ? -1 : undefined}
      style={{ colorScheme: 'light' }}
      className={`absolute inset-0 w-full h-full border-0 ${status === 'ready' ? 'opacity-100' : 'opacity-0'}`} />
    {!decorative && status === 'loading' && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-slate-500 dark:text-slate-300" role="status">
      <span aria-hidden="true" className="text-3xl motion-safe:animate-pulse">🌸</span><span className="text-xs">Loading Yu…</span>
    </div>}
    {!decorative && status === 'error' && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 text-center bg-white/90 dark:bg-slate-900/90 rounded-2xl" role="alert">
      {model === 'portrait' && <img src={`${import.meta.env.BASE_URL}live2d/yu-xii-poster.jpg`} alt="Static Yu XII artwork" className="absolute inset-0 w-full h-full object-contain opacity-45" />}
      <p className="relative rounded-xl bg-white/90 dark:bg-slate-900/90 p-3 text-xs text-slate-600 dark:text-slate-300">{error}</p>
      <button onClick={() => { setStatus('loading'); setError(''); setAttempt(value => value + 1); }} className="relative rounded-full bg-violet-100 dark:bg-violet-900 px-4 py-2 text-xs font-bold">Retry loading Yu</button>
    </div>}
  </div>;
});
Live2DFrame.displayName = 'Live2DFrame';
export default Live2DFrame;
