// Site-wide effects, loaded after first paint. Nothing here is needed to read or use the site:
// without JavaScript, or with reduced motion, every page is complete and still.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;
const root = document.documentElement;
const inView = (el: Element) => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; };

/* ---------- RGB-split glitch ---------- */
function glitch(el: Element) {
  if (reduce || el.classList.contains('is-glitching')) return;
  el.classList.add('is-glitching');
  setTimeout(() => el.classList.remove('is-glitching'), 450);
}
for (const el of document.querySelectorAll('[data-glitch-load]')) setTimeout(() => glitch(el), 350);
for (const el of document.querySelectorAll('[data-glitch-hover]')) {
  const target = el.querySelector('.glitch, .glitch-img') ?? el;
  el.addEventListener('pointerenter', () => glitch(target));
  el.addEventListener('focusin', () => glitch(target));
}
// Every 6 to 10 s the page title glitches, or the top section heading on screen once the title is scrolled away.
// Skipped while the tab is hidden or text is selected.
function idleGlitch() {
  const sel = document.getSelection();
  if (!document.hidden && (!sel || sel.isCollapsed)) {
    const heading = [...document.querySelectorAll('h1 .glitch, h2')].find(inView);
    if (heading) glitch(heading);
  }
  setTimeout(idleGlitch, 6000 + Math.random() * 4000);
}
if (!reduce) setTimeout(idleGlitch, 6000 + Math.random() * 4000);

/* ---------- Pixel dissolve: a grid of background-coloured blocks clears in random order ---------- */
export function dissolve(el: HTMLElement, colour = getComputedStyle(root).getPropertyValue('--bg'), ms = 650) {
  if (reduce) return;
  const box = el.getBoundingClientRect();
  if (!box.width || !box.height) return;
  const cell = Math.max(10, Math.round(Math.min(box.width, box.height) / 18));
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(box.width / cell);
  canvas.height = Math.ceil(box.height / cell);
  Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', imageRendering: 'pixelated', pointerEvents: 'none', zIndex: '5' });
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = colour;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
  el.append(canvas);
  const cells = Array.from({ length: canvas.width * canvas.height }, (_, i) => i).sort(() => Math.random() - 0.5);
  const start = performance.now();
  let done = 0;
  const frame = (now: number) => {
    const target = Math.min(cells.length, Math.round(((now - start) / ms) * cells.length));
    for (; done < target; done++) ctx.clearRect(cells[done] % canvas.width, Math.floor(cells[done] / canvas.width), 1, 1);
    if (done < cells.length) requestAnimationFrame(frame);
    else canvas.remove();
  };
  requestAnimationFrame(frame);
}

/* ---------- Reveals: content is only hidden once this script is running ---------- */
const reveal = (el: HTMLElement) => {
  el.classList.add('is-in');
  if (el.hasAttribute('data-dissolve')) dissolve(el);
};
const watched = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
for (const el of watched) if (inView(el)) el.classList.add('is-in'); // already on screen: show at once, no hide-flash
root.classList.add('fx');
if (reduce) watched.forEach((el) => el.classList.add('is-in'));
else {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { io.unobserve(e.target); reveal(e.target as HTMLElement); }
  }, { rootMargin: '0px 0px -8% 0px' });
  watched.filter((el) => !el.classList.contains('is-in')).forEach((el) => io.observe(el));
}

/* ---------- 3D tilt toward the pointer ---------- */
if (finePointer && !reduce) {
  for (const el of document.querySelectorAll<HTMLElement>('[data-tilt]')) {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${(x * 12).toFixed(2)}deg`);
      el.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`);
    });
    el.addEventListener('pointerleave', () => { el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); });
  }
}

/* ---------- First-visit loader: every game's hero runs across, then the screen dissolves ---------- */
const tpl = document.querySelector<HTMLTemplateElement>('#loader-template');
let seen = true;
try { seen = localStorage.getItem('glitch-intro') === 'seen'; } catch {}
if (tpl && !seen && !reduce) {
  const overlay = tpl.content.firstElementChild!.cloneNode(true) as HTMLElement;
  document.body.append(overlay);
  try { localStorage.setItem('glitch-intro', 'seen'); } catch {}
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    overlay.classList.add('is-leaving');
    dissolve(overlay, getComputedStyle(root).getPropertyValue('--bg'), 420);
    setTimeout(() => overlay.remove(), 450);
    removeEventListener('keydown', close);
  };
  overlay.querySelector('button')?.addEventListener('click', close);
  overlay.addEventListener('click', close);
  addEventListener('keydown', close);
  setTimeout(close, 1900);
}
