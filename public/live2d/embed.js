/* Each iframe owns one Spine 3.8 instance; resources stay on the portfolio's origin. */
(() => {
  'use strict';
  const channel = 'huaike-yu-stage';
  const params = new URLSearchParams(location.search);
  const model = params.get('model');
  const backdrop = params.has('background');
  const snapshot = params.has('snapshot');
  const canvas = document.getElementById('stage');
  if (snapshot) {
    canvas.style.width = 'min(100vw, 100vh)';
    canvas.style.height = 'min(100vw, 100vh)';
  }
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const notify = (type, detail = {}) => parent.postMessage({ channel, type, ...detail }, location.origin);
  let gl, texture, atlas, shader, batcher, renderer, skeleton, state, data, camera;
  let frame = 0, last = 0, disposed = false, failed = false, paused = false, forcedMotion = false;
  let current = '', rest = '', active = false;
  const abort = new AbortController();
  const timeout = setTimeout(() => fail('Loading took too long. Please retry.'), 45000);

  function fail(message) {
    if (disposed || failed) return;
    failed = true;
    abort.abort();
    clearTimeout(timeout);
    cancelAnimationFrame(frame);
    canvas.dataset.status = 'error';
    notify('error', { message });
  }

  function measure() {
    const offset = new spine.Vector2(), size = new spine.Vector2();
    skeleton.getBounds(offset, size, []);
    return { x: offset.x, y: offset.y, width: Math.max(1, size.x), height: Math.max(1, size.y) };
  }

  function setAction(name) {
    if (!state || !data.findAnimation(name)) return;
    current = name;
    forcedMotion = name !== rest;
    const once = name === 'Interact' || name === 'Special';
    state.clearTracks();
    skeleton.setToSetupPose();
    state.setAnimation(0, name, !once);
    if (once) state.addAnimation(0, rest, true, 0);
    state.apply(skeleton);
    skeleton.updateWorldTransform();
    camera = measure();
    canvas.dataset.animation = name;
    notify('animation', { animation: name });
    draw();
    schedule();
  }

  function draw() {
    if (!gl || !skeleton || failed || disposed) return;
    const width = canvas.clientWidth, height = canvas.clientHeight;
    if (!width || !height) return;
    const ratio = Math.min(devicePixelRatio || 1, backdrop || snapshot ? 1 : model === 'chibi' ? 1.5 : 2);
    const pixelWidth = Math.round(width * ratio), pixelHeight = Math.round(height * ratio);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    gl.viewport(0, 0, pixelWidth, pixelHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Keep the camera still during breathing; expand only if an action exceeds its frame.
    const bounds = measure();
    const right = Math.max(camera.x + camera.width, bounds.x + bounds.width);
    const top = Math.max(camera.y + camera.height, bounds.y + bounds.height);
    camera.x = Math.min(camera.x, bounds.x);
    camera.y = Math.min(camera.y, bounds.y);
    camera.width = right - camera.x;
    camera.height = top - camera.y;
    const fit = Math.min(width / camera.width, height / camera.height) * 0.91;
    const worldWidth = width / fit, worldHeight = height / fit;
    const projection = new spine.webgl.Matrix4();
    projection.ortho2d(camera.x + camera.width / 2 - worldWidth / 2,
      camera.y + camera.height / 2 - worldHeight / 2, worldWidth, worldHeight);
    shader.bind();
    shader.setUniformi(spine.webgl.Shader.SAMPLER, 0);
    shader.setUniform4x4f(spine.webgl.Shader.MVP_MATRIX, projection.values);
    batcher.begin(shader);
    renderer.premultipliedAlpha = true;
    renderer.draw(batcher, skeleton);
    batcher.end();
    shader.unbind();
  }

  function shouldAnimate() {
    return !disposed && !failed && !paused && !document.hidden &&
      (!motionPreference.matches || forcedMotion);
  }

  function tick(now) {
    frame = 0;
    if (!shouldAnimate()) { last = 0; return; }
    if (!last) last = now;
    if (now - last >= 1000 / (backdrop ? 20 : 30)) {
      state.update(Math.min((now - last) / 1000, 0.1));
      state.apply(skeleton);
      skeleton.updateWorldTransform();
      last = now;
      const entry = state.getCurrent(0);
      if (entry && entry.animation.name !== current) {
        current = entry.animation.name;
        forcedMotion = current !== rest;
        camera = measure();
        canvas.dataset.animation = current;
        notify('animation', { animation: current });
      }
      draw();
    }
    schedule();
  }

  function schedule() {
    if (!active || frame || !shouldAnimate()) return;
    frame = requestAnimationFrame(tick);
  }

  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== parent || event.data?.channel !== channel) return;
    if (event.data.type === 'action' && typeof event.data.animation === 'string') setAction(event.data.animation);
    if (event.data.type === 'pause') {
      paused = Boolean(event.data.paused);
      last = 0;
      cancelAnimationFrame(frame);
      frame = 0;
      canvas.dataset.paused = String(paused);
      schedule();
    }
  });
  canvas.addEventListener('click', () => setAction('Interact'));
  canvas.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setAction('Interact'); }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') notify('close');
  });
  document.addEventListener('visibilitychange', () => { last = 0; schedule(); });
  motionPreference.addEventListener('change', () => { last = 0; schedule(); });
  const resize = new ResizeObserver(() => draw());
  resize.observe(canvas);
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); fail('The graphics context was interrupted. Please retry.'); });
  window.addEventListener('pagehide', () => {
    disposed = true;
    abort.abort();
    clearTimeout(timeout);
    cancelAnimationFrame(frame);
    resize.disconnect();
    batcher?.dispose();
    shader?.dispose();
    texture?.dispose();
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  });

  async function initialize() {
    try {
      if (!['chibi', 'portrait'].includes(model)) throw new Error('Unknown Yu model.');
      if (!window.spine) throw new Error('The animation renderer could not be loaded.');
      gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true, preserveDrawingBuffer: snapshot });
      if (!gl) throw new Error('WebGL is unavailable in this browser.');
      const folder = `./models/${model}/`;
      const read = async (file, binary = false) => {
        const response = await fetch(folder + file, { signal: abort.signal });
        if (!response.ok) throw new Error('A character resource could not be loaded.');
        return binary ? new Uint8Array(await response.arrayBuffer()) : response.text();
      };
      const image = new Image();
      const imageReady = new Promise((resolve, reject) => {
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('The character texture could not be loaded.'));
        image.src = folder + 'model.png';
      });
      const [atlasText, binary] = await Promise.all([read('model.atlas'), read('model.skel', true), imageReady]);
      if (disposed || failed) return;
      texture = new spine.webgl.GLTexture(gl, image);
      try {
        atlas = new spine.TextureAtlas(atlasText, () => texture);
        data = new spine.SkeletonBinary(new spine.AtlasAttachmentLoader(atlas)).readSkeletonData(binary);
      } catch {
        throw new Error('The character animation could not be read. Please retry.');
      }
      skeleton = new spine.Skeleton(data);
      const settings = new spine.AnimationStateData(data);
      settings.defaultMix = 0.15;
      state = new spine.AnimationState(settings);
      shader = spine.webgl.Shader.newTwoColoredTextured(gl);
      batcher = new spine.webgl.PolygonBatcher(gl);
      renderer = new spine.webgl.SkeletonRenderer(gl);
      rest = model === 'chibi' ? 'Relax' : 'Idle';
      active = true;
      setAction(rest);
      if (snapshot) {
        const download = document.createElement('a');
        download.textContent = 'Save transparent preview';
        download.download = 'yu-xii-background.webp';
        download.href = canvas.toDataURL('image/webp', 0.84);
        download.style.cssText = 'position:fixed;right:16px;top:16px;padding:12px 16px;border-radius:24px;background:#fff;color:#5b21b6;font:14px sans-serif;box-shadow:0 2px 12px #0002;text-decoration:none';
        document.body.appendChild(download);
      }
      clearTimeout(timeout);
      canvas.dataset.status = 'ready';
      notify('ready', { animations: data.animations.map(animation => animation.name).filter(name => name !== 'Default'), animation: rest });
    } catch (error) { fail(error instanceof Error ? error.message : 'The character could not be loaded.'); }
  }
  initialize();
})();
