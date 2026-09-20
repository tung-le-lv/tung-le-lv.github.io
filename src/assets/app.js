// Progressive enhancement: every page is complete HTML; this adds animated in-place navigation,
// search, TOC scroll-spy, code copy, Mermaid rendering and theming. No backend involved.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const isDark = () => root.dataset.theme === 'dark'; // light is the default; dark only by explicit choice

/* ---------------- Theme ---------------- */
$('.theme-btn').addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark';
  const apply = () => { root.dataset.theme = next; try { localStorage.setItem('theme', next); } catch {} renderDiagrams(); };
  document.startViewTransition && !reduceMotion.matches ? document.startViewTransition(apply) : apply();
});

/* ---------------- Real viewport height (iOS toolbars make 100vh unreliable) ---------------- */
const setAppHeight = () => root.style.setProperty('--app-h', `${window.visualViewport?.height ?? innerHeight}px`);
setAppHeight();
addEventListener('resize', setAppHeight);
addEventListener('orientationchange', () => setTimeout(setAppHeight, 200));
window.visualViewport?.addEventListener('resize', setAppHeight);

/* ---------------- Mobile nav ---------------- */
const closeNav = () => document.body.classList.remove('nav-open');
$('.menu-btn').addEventListener('click', () => document.body.classList.toggle('nav-open'));
$('.scrim').addEventListener('click', closeNav);

/* ---------------- Sidebar state ---------------- */
const navToggle = $('.nav-toggle');
const navGroups = () => $$('#sidebar details');
function updateNavToggle() {
  const anyOpen = navGroups().some((d) => d.open);
  navToggle.dataset.state = anyOpen ? 'collapse' : 'expand';
  navToggle.title = anyOpen ? 'Collapse all' : 'Expand all';
  navToggle.setAttribute('aria-label', anyOpen ? 'Collapse all sections' : 'Expand all sections');
}
navToggle.addEventListener('click', () => {
  const open = navToggle.dataset.state === 'expand';      // expand when everything is closed, otherwise collapse
  navGroups().forEach((d) => (d.open = open));
  updateNavToggle();
});
$('#sidebar').addEventListener('toggle', updateNavToggle, true);   // keep the label right when a group is toggled by hand

function syncSidebar() {
  const path = location.pathname;
  let active;
  $$('#sidebar .nav-link').forEach((a) => {
    const on = a.dataset.path === path;
    on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
    if (on) active = a;
  });
  const cat = path.split('/')[1];
  const det = $(`#sidebar .nav-cat[data-cat="${CSS.escape(cat)}"]`);
  if (det) det.open = true;
  for (let d = active?.closest('details'); d; d = d.parentElement?.closest('details')) d.open = true;
  updateNavToggle();
  if (active) {
    const box = $('#sidebar'), r = active.getBoundingClientRect(), b = box.getBoundingClientRect();
    if (r.top < b.top || r.bottom > b.bottom) active.scrollIntoView({ block: 'center', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }
}

/* ---------------- Per-page enhancements ---------------- */
let spy;
function initPage() {
  const content = $('#content');
  // staggered entrance
  [...content.children].forEach((el, i) => el.style.setProperty('--i', Math.min(i, 8)));

  // copy buttons
  $$('.code .copy', content).forEach((btn) => btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText($('code', btn.closest('.code')).innerText); btn.textContent = 'Copied ✓'; }
    catch { btn.textContent = 'Press ⌘C'; }
    setTimeout(() => (btn.textContent = 'Copy'), 1600);
  }));

  // TOC scroll-spy
  spy?.disconnect();
  const links = $$('.toc .toc-link', content);
  if (links.length) {
    const map = new Map(links.map((a) => [decodeURIComponent(a.hash.slice(1)), a]));
    const heads = [...map.keys()].map((id) => document.getElementById(id)).filter(Boolean);
    const visible = new Set();
    const mark = () => {
      const cur = heads.find((h) => visible.has(h)) ?? [...heads].reverse().find((h) => h.getBoundingClientRect().top < 120) ?? heads[0];
      links.forEach((a) => a.classList.toggle('active', a === map.get(cur?.id)));
      map.get(cur?.id)?.scrollIntoView({ block: 'nearest' });
    };
    spy = new IntersectionObserver((es) => { es.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target))); mark(); }, { rootMargin: '-72px 0px -70% 0px' });
    heads.forEach((h) => spy.observe(h));
    mark();
  }
  $$('.toc-inline a', content).forEach((a) => a.addEventListener('click', () => (a.closest('details').open = false)));

  // progress bar takes the current category's colour
  bar.style.setProperty('--bar', content.style.getPropertyValue('--accent') || '');

  // article images open in the lightbox
  $$('.prose img', content).forEach((img) => {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `Enlarge image${img.alt ? `: ${img.alt}` : ''}`);
  });

  renderDiagrams();
  onScroll();
}

/* ---------------- Mermaid ---------------- */
let mermaidP;
async function renderDiagrams() {
  const nodes = $$('pre.mermaid');
  if (!nodes.length) return;
  mermaidP ??= import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs').then((m) => m.default);
  let mermaid;
  try { mermaid = await mermaidP; } catch { return; } // offline: raw source stays visible
  const dark = isDark();
  mermaid.initialize({
    startOnLoad: false, theme: dark ? 'dark' : 'neutral', fontFamily: 'Inter, system-ui, sans-serif',
    themeVariables: dark ? { primaryColor: '#1e2433', primaryBorderColor: '#0ea5e9', lineColor: '#8892a4', primaryTextColor: '#e8ebf2' } : { primaryColor: '#e0f4ff', primaryBorderColor: '#0ea5e9' },
  });
  for (const n of nodes) { n.removeAttribute('data-processed'); n.textContent = n.dataset.src; }
  try { await mermaid.run({ nodes }); } catch (e) { console.warn('mermaid', e); }
  // keep very wide diagrams legible: scroll horizontally rather than shrinking to fit
  for (const n of nodes) {
    const svg = $('svg', n), w = svg?.viewBox?.baseVal?.width;
    if (w > 1000) svg.style.minWidth = `${w}px`; // only truly wide diagrams scroll; the rest shrink to fit
  }
}

/* ---------------- Reading progress ---------------- */
const bar = $('#progress');
const toTop = $('.to-top');
function onScroll() {
  const h = document.documentElement.scrollHeight - innerHeight;
  const article = $('#content').dataset.kind === 'article';
  bar.style.transform = `scaleX(${article && h > 0 ? Math.min(1, scrollY / h) : 0})`;
  toTop.classList.toggle('visible', article && scrollY > 500); // back-to-top only on long reads
}
toTop.addEventListener('click', () => {
  scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  toTop.blur();
});
addEventListener('scroll', onScroll, { passive: true });

/* ---------------- Page transitions ---------------- */
const cache = new Map();
const fetchPage = (url) => {
  if (!cache.has(url)) cache.set(url, fetch(url).then((r) => (r.ok || r.status === 404 ? r.text().then((t) => ({ ok: r.ok, html: t })) : Promise.reject(r.status))));
  return cache.get(url);
};
let navId = 0;

async function navigate(url, { push = true } = {}) {
  const id = ++navId;
  let res;
  try { res = await fetchPage(url.pathname + url.search); } catch { location.href = url.href; return; }
  if (id !== navId) return;
  const doc = new DOMParser().parseFromString(res.html, 'text/html');
  const next = $('#content', doc);
  if (!next) { location.href = url.href; return; }

  const swap = () => {
    if (push) history.pushState(null, '', url.href);
    lastPath = url.pathname + url.search;
    document.title = doc.title;
    const desc = $('meta[name="description"]');
    if (desc) desc.content = $('meta[name="description"]', doc)?.content ?? '';
    const c = $('#content');
    c.replaceWith(document.adoptNode(next));
    closeNav();
    closeLightbox();
    syncSidebar();
    initPage();
    const target = url.hash && document.getElementById(decodeURIComponent(url.hash.slice(1)));
    target ? target.scrollIntoView() : scrollTo({ top: 0, behavior: 'instant' });
    onScroll();
  };

  if (document.startViewTransition && !reduceMotion.matches) {
    const vt = document.startViewTransition(swap);
    await vt.finished.catch(() => {});
  } else if (!reduceMotion.matches) {
    const c = $('#content');
    c.classList.add('leaving');
    await new Promise((r) => setTimeout(r, 160));
    swap();
  } else swap();
}

const internal = (a) =>
  a && a.origin === location.origin && !a.target && !a.hasAttribute('download') &&
  !/\.[a-z0-9]+$/i.test(a.pathname) && a.pathname !== '/404.html';

document.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!internal(a) || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (a.pathname === location.pathname && a.search === location.search) {
    if (a.hash) return; // in-page anchor: native smooth scroll
    e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); return;
  }
  e.preventDefault();
  navigate(new URL(a.href));
});
let lastPath = location.pathname + location.search;
addEventListener('popstate', () => {
  const cur = location.pathname + location.search;
  if (cur === lastPath) return; // hash-only change
  lastPath = cur;
  navigate(new URL(location.href), { push: false });
});
document.addEventListener('pointerover', (e) => {
  const a = e.target.closest?.('a');
  if (internal(a) && a.pathname !== location.pathname) fetchPage(a.pathname + a.search).catch(() => {});
});

/* ---------------- Image lightbox ---------------- */
let lb, lbOpener;
function buildLightbox() {
  lb = document.createElement('div');
  lb.id = 'lightbox';
  lb.hidden = true;
  lb.innerHTML = `<div class="lb-backdrop"></div>
    <div class="lb-stage"><img alt=""></div>
    <div class="lb-bar"><span class="lb-caption"></span><span class="lb-hint">Click image to zoom · Esc to close</span></div>
    <button type="button" class="lb-close" aria-label="Close image">&times;</button>`;
  document.body.appendChild(lb);
  $('.lb-backdrop', lb).addEventListener('click', closeLightbox);
  $('.lb-close', lb).addEventListener('click', closeLightbox);
  $('.lb-stage', lb).addEventListener('click', (e) => {
    if (e.target.tagName !== 'IMG') return closeLightbox(); // click on empty stage closes
    lb.classList.toggle('zoomed');
  });
}
function openLightbox(img) {
  if (!lb) buildLightbox();
  const big = $('.lb-stage img', lb);
  big.src = img.currentSrc || img.src;
  big.alt = img.alt;
  $('.lb-caption', lb).textContent = img.alt;
  lb.classList.remove('zoomed');
  lb.hidden = false;
  lbOpener = img;
  document.body.classList.add('lb-open');
  $('.lb-close', lb).focus({ preventScroll: true });
  if (!reduceMotion.matches && big.animate) {
    // FLIP: grow from the thumbnail's position to its enlarged position
    const from = img.getBoundingClientRect(), to = big.getBoundingClientRect();
    if (to.width && to.height) {
      big.animate([
        { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`, opacity: .6 },
        { transform: 'none', opacity: 1 },
      ], { duration: 280, easing: 'cubic-bezier(.2,.7,.2,1)' });
    }
    $('.lb-backdrop', lb).animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220 });
  }
}
function closeLightbox() {
  if (!lb || lb.hidden) return;
  const done = () => { lb.hidden = true; document.body.classList.remove('lb-open'); lbOpener?.focus?.({ preventScroll: true }); lbOpener = null; };
  if (!reduceMotion.matches && lb.animate) lb.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150 }).onfinish = done;
  else done();
}
document.addEventListener('click', (e) => {
  const img = e.target.closest?.('.prose img');
  if (img && !img.closest('a')) openLightbox(img);
});
document.addEventListener('keydown', (e) => {
  if (lb && !lb.hidden && e.key === 'Escape') { e.stopPropagation(); closeLightbox(); return; }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('.prose img')) { e.preventDefault(); openLightbox(e.target); }
}, true);

/* ---------------- Search ---------------- */
const dlg = $('#search'), input = $('input', dlg), list = $('.search-results', dlg);
let index, results = [], sel = 0;
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const loadIndex = () => (index ??= fetch('/search.json').then((r) => r.json()).catch(() => []));

function mark(text, terms) {
  const re = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  return esc(text).replace(re, '<mark>$1</mark>');
}
function score(doc, terms) {
  let total = 0;
  const lower = { t: doc.t.toLowerCase(), g: doc.g.join(' ').toLowerCase(), h: doc.h.join(' ').toLowerCase(), d: doc.d.toLowerCase(), x: doc.x.toLowerCase() };
  for (const t of terms) {
    let s = 0;
    if (lower.t.includes(t)) s += lower.t.startsWith(t) ? 14 : 10;
    if (lower.g.includes(t)) s += 6;
    if (lower.h.includes(t)) s += 4;
    if (lower.d.includes(t)) s += 3;
    if (lower.x.includes(t)) s += 1;
    if (!s) return 0; // every term must match somewhere
    total += s;
  }
  return total;
}
function snippet(doc, terms) {
  const low = doc.x.toLowerCase();
  const i = terms.map((t) => low.indexOf(t)).filter((n) => n >= 0).sort((a, b) => a - b)[0];
  if (i === undefined) return doc.d;
  const from = Math.max(0, i - 50);
  return (from ? '…' : '') + doc.x.slice(from, from + 170) + '…';
}
async function runSearch() {
  const docs = await loadIndex();
  const terms = input.value.toLowerCase().split(/\s+/).filter(Boolean);
  results = terms.length
    ? docs.map((d) => ({ d, s: score(d, terms) })).filter((r) => r.s).sort((a, b) => b.s - a.s).slice(0, 8).map((r) => r.d)
    : docs.slice(0, 8);
  sel = 0;
  list.innerHTML = results.length
    ? results.map((d, i) => `<li role="option" aria-selected="${i === 0}"><a href="${d.u}" style="--k:${d.k}"><div class="sr-top"><span class="sr-title">${mark(d.t, terms.length ? terms : ['\0'])}</span><span class="sr-cat">${esc(d.c)}</span></div><div class="sr-snip">${mark(terms.length ? snippet(d, terms) : d.d, terms.length ? terms : ['\0'])}</div></a></li>`).join('')
    : `<li class="sr-empty">No results for “${esc(input.value)}”</li>`;
}
function select(n) {
  const items = $$('li[role=option]', list);
  if (!items.length) return;
  sel = (n + items.length) % items.length;
  items.forEach((li, i) => li.setAttribute('aria-selected', i === sel));
  items[sel].scrollIntoView({ block: 'nearest' });
}
// keep the popup inside the visible area: on iOS the on-screen keyboard shrinks visualViewport, not the layout viewport
const fitSearch = () => { const vv = window.visualViewport; dlg.style.setProperty('--vvh', `${vv ? vv.height : innerHeight}px`); if (vv) dlg.style.transform = `translateY(${vv.offsetTop}px)`; };
window.visualViewport?.addEventListener('resize', fitSearch);
window.visualViewport?.addEventListener('scroll', fitSearch);
const openSearch = () => { dlg.hidden = false; document.body.classList.add('search-open'); fitSearch(); input.value = ''; runSearch(); input.focus({ preventScroll: true }); };
const closeSearch = () => { dlg.hidden = true; document.body.classList.remove('search-open'); };
document.addEventListener('click', (e) => { if (e.target.closest('.search-btn')) openSearch(); });
$('.search-backdrop', dlg).addEventListener('click', closeSearch);
input.addEventListener('input', runSearch);
list.addEventListener('click', (e) => { if (e.target.closest('a')) closeSearch(); });
list.addEventListener('mousemove', (e) => { const li = e.target.closest('li[role=option]'); if (li) select($$('li[role=option]', list).indexOf(li)); });
addEventListener('keydown', (e) => {
  const typing = /^(input|textarea|select)$/i.test(document.activeElement?.tagName);
  if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) { e.preventDefault(); dlg.hidden ? openSearch() : closeSearch(); return; }
  if (dlg.hidden) return;
  if (e.key === 'Escape') closeSearch();
  else if (e.key === 'ArrowDown') { e.preventDefault(); select(sel + 1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); select(sel - 1); }
  else if (e.key === 'Enter') { const a = $$('li[role=option] a', list)[sel]; if (a) { e.preventDefault(); a.click(); } }
});
if (!/Mac|iPhone|iPad/.test(navigator.platform)) $$('.search-btn kbd').forEach((k) => (k.textContent = 'Ctrl K'));

syncSidebar();
initPage();
