// HTML templates (plain template strings, no framework)

export const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const ICONS = {
  layers: '<path d="m12 2 10 5-10 5L2 7l10-5Z"/><path d="m2 12 10 5 10-5"/><path d="m2 17 10 5 10-5"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
  cube: '<path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  note: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/>',
  tip: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3Z"/>',
  warning: '<path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17h.01"/>',
  important: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5h.01"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z"/><path d="M4 21a2 2 0 0 1 2-2h13"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Z"/><path d="M7.5 7.5h.01"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  arrowUp: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  collapseAll: '<path d="m7 20 5-5 5 5M7 4l5 5 5-5"/>',
  expandAll: '<path d="m7 15 5 5 5-5M7 9l5-5 5 5"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
};

export const icon = (name, cls = '') =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] ?? ICONS.note}</svg>`;

const fmt = (d) => (d ? new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '');
const count = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

const tagChip = (t) => `<a class="chip" href="/tags/${t.slug ?? t}/">${icon('tag')}${esc(t.name ?? t)}</a>`;
const tagLinks = (ctx, names) => names.map((n) => tagChip(ctx.tags.find((t) => t.name === n))).join('');

// ---------- Layout ----------
const contains = (n, a) => !!a && (n.articles.includes(a) || n.children.some((c) => contains(c, a)));
const navLink = (a) => `<a class="nav-link" href="${a.url}" data-path="${a.url}">${esc(a.title)}</a>`;
function navNodes(n, cur, openAll) {
  return n.articles.map(navLink).join('') + n.children.map((ch) => `
        <details class="nav-sub"${openAll || contains(ch, cur) ? ' open' : ''}>
          <summary>${icon('chevron', 'nav-chev')}<span>${esc(ch.name)}</span></summary>
          <div class="nav-sub-items">${navNodes(ch, cur, openAll)}</div>
        </details>`).join('');
}

function sidebar(ctx, cur) {
  const groups = ctx.categories.map((c) => {
    const open = cur.cat?.slug === c.slug;
    const items = navNodes(c.tree, cur.article, open && !cur.article);
    return `
    <details class="nav-cat" style="--c:${c.color}" data-cat="${c.slug}"${open ? ' open' : ''}>
      <summary><span class="nav-ico">${icon(c.icon)}</span><span class="nav-title">${esc(c.title)}</span><span class="nav-count">${c.articles.length}</span>${icon('chevron', 'nav-chev')}</summary>
      <div class="nav-items">
        <a class="nav-link nav-overview" href="/${c.slug}/" data-path="/${c.slug}/">Overview</a>
        ${items || '<span class="nav-empty">No articles yet</span>'}
      </div>
    </details>`;
  }).join('');
  return `
  <aside id="sidebar" class="sidebar" aria-label="Documentation navigation">
    <div class="nav-pin">
      <a class="nav-link nav-home" href="/" data-path="/">${icon('layers')}<span>Home</span></a>
      <button type="button" class="nav-toggle" data-state="collapse" aria-label="Collapse all sections" title="Collapse all">
        <span class="i-collapse">${icon('collapseAll')}</span><span class="i-expand">${icon('expandAll')}</span>
      </button>
    </div>
    <nav>
      ${groups}
      <a class="nav-link nav-home" href="/tags/" data-path="/tags/">${icon('tag')}<span>All tags</span></a>
    </nav>
  </aside>`;
}

export function page(ctx, o) {
  const { site, v } = ctx;
  const url = site.url + o.path;
  const accent = o.cat?.color ?? '#0284c7';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.description)}">
${o.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${esc(url)}">`}
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.description)}">
<meta property="og:type" content="${o.kind === 'article' ? 'article' : 'website'}">
<meta property="og:url" content="${esc(url)}">
<meta name="theme-color" content="#fbfbfd">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script>try{var t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
<link rel="stylesheet" href="/assets/style.css?v=${v}">
<link rel="stylesheet" href="/assets/dict.css?v=${v}">
<script type="module" src="/assets/app.js?v=${v}"></script>
</head>
<body>
<div id="progress" aria-hidden="true"></div>
<header class="topbar">
  <button class="icon-btn menu-btn" type="button" aria-label="Toggle navigation" aria-controls="sidebar">${icon('menu')}</button>
  <a class="brand" href="/" data-path="/"><span class="brand-mark">${icon('layers')}</span><span class="brand-text">${esc(site.title)}</span></a>
  <div class="topbar-spacer"></div>
  <button class="search-btn" type="button" aria-label="Search documentation">${icon('search')}<span>Search docs</span><kbd>⌘K</kbd></button>
  <button class="icon-btn theme-btn" type="button" aria-label="Toggle colour theme"><span class="i-sun">${icon('sun')}</span><span class="i-moon">${icon('moon')}</span></button>
</header>
<div class="shell">
${sidebar(ctx, o)}
<div class="scrim" aria-hidden="true"></div>
<main id="content" class="content" data-kind="${o.kind}" style="--accent:${accent}">
${o.body}
</main>
</div>
<button type="button" class="to-top" aria-label="Back to top" title="Back to top">${icon('arrowUp')}</button>
<div id="search" class="search" hidden>
  <div class="search-backdrop"></div>
  <div class="search-panel" role="dialog" aria-modal="true" aria-label="Search" tabindex="-1">
    <div class="search-input">${icon('search')}<input type="search" placeholder="Search articles, headings, tags…" autocomplete="off" spellcheck="false" aria-label="Search query"><kbd>esc</kbd><button type="button" class="search-close" aria-label="Close search">${icon('close')}</button></div>
    <ul class="search-results" role="listbox"></ul>
    <div class="search-foot"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> open</span></div>
  </div>
</div>
</body>
</html>
`;
}

// ---------- Views ----------
function articleCard(ctx, a, { showCat = false } = {}) {
  return `
  <a class="card article-card" href="${a.url}" style="--c:${a.category.color}">
    ${showCat ? `<span class="card-cat">${esc(a.category.title)}</span>` : ''}
    <h3>${esc(a.title)}</h3>
    <p>${esc(a.description)}</p>
    <div class="card-meta"><span>${icon('clock')}${a.readingMinutes} min read</span>${a.updated ? `<span>${fmt(a.updated)}</span>` : ''}</div>
  </a>`;
}

export function homeView(ctx) {
  const { site, categories, all, tags } = ctx;
  return `
<section class="hero">
  <p class="eyebrow">${esc(site.author)}</p>
  <h1>${esc(site.tagline)}</h1>
  <p class="lede">${esc(site.description)}</p>
  <button class="hero-search search-btn" type="button">${icon('search')}<span>Search ${count(all.length, 'article')}…</span><kbd>⌘K</kbd></button>
</section>
<section>
  <h2 class="section-title">Browse by topic</h2>
  <div class="grid cats">
    ${categories.map((c) => `
    <a class="card cat-card" href="/${c.slug}/" style="--c:${c.color}">
      <span class="cat-ico">${icon(c.icon)}</span>
      <h3>${esc(c.title)}</h3>
      <p>${esc(c.description)}</p>
      <span class="card-foot">${c.articles.length ? count(c.articles.length, 'article') : 'Coming soon'}${icon('arrowRight')}</span>
    </a>`).join('')}
  </div>
</section>
<section>
  <h2 class="section-title">Latest articles</h2>
  <div class="grid articles">${all.slice(0, 6).map((a) => articleCard(ctx, a, { showCat: true })).join('')}</div>
</section>
<section>
  <h2 class="section-title">Popular tags</h2>
  <div class="chips">${tags.slice(0, 16).map(tagChip).join('')}</div>
</section>`;
}

export function categoryView(ctx, c) {
  const sections = [];
  (function walk(n) { if (n.articles.length) sections.push(n); n.children.forEach(walk); })(c.tree);
  const body = sections.length
    ? sections.map((n) => `
      <section>
        ${n.path.length ? `<h2 class="section-title">${esc(n.path.join(' › '))}</h2>` : ''}
        <div class="grid articles">${n.articles.map((a) => articleCard(ctx, a)).join('')}</div>
      </section>`).join('')
    : `<div class="empty">${icon(c.icon)}<h3>Articles are on their way</h3><p>Nothing published in ${esc(c.title)} yet — check back soon.</p></div>`;
  return `
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>${esc(c.title)}</span></nav>
<header class="page-head">
  <span class="cat-ico big">${icon(c.icon)}</span>
  <div><h1>${esc(c.title)}</h1><p class="lede">${esc(c.description)}</p></div>
</header>
${body}`;
}

export function articleView(ctx, a) {
  const c = a.category;
  const tocLinks = a.toc.map((t) => `<a class="toc-link depth-${t.depth}" href="#${t.id}">${esc(t.text)}</a>`).join('');
  const nav = (x, dir) => x ? `
    <a class="pn ${dir}" href="${x.url}">
      <span class="pn-label">${dir === 'prev' ? icon('arrowLeft') + 'Previous' : 'Next' + icon('arrowRight')}</span>
      <span class="pn-title">${esc(x.title)}</span>
    </a>` : '<span></span>';
  return `
<div class="article-layout" ${a.hasMermaid ? 'data-mermaid' : ''}>
  <article class="article">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/${c.slug}/">${esc(c.title)}</a>${a.path.map((p) => `<span>/</span><span>${esc(p)}</span>`).join('')}</nav>
    <header class="article-head">
      <h1>${esc(a.title)}</h1>
      ${a.description ? `<p class="lede">${esc(a.description)}</p>` : ''}
      <div class="meta">
        <span>${icon('clock')}${a.readingMinutes} min read</span>
        ${a.updated ? `<span>Updated ${fmt(a.updated)}</span>` : ''}
      </div>
      ${a.tags.length ? `<div class="chips">${tagLinks(ctx, a.tags)}</div>` : ''}
    </header>
    ${a.toc.length ? `<details class="toc-inline"><summary>${icon('list')}On this page</summary><div>${tocLinks}</div></details>` : ''}
    <div class="${a.raw ? 'dict' : 'prose'}">
${a.html}
    </div>
    <footer class="article-foot">
      <nav class="prev-next" aria-label="More in ${esc(c.title)}">${nav(a.prev, 'prev')}${nav(a.next, 'next')}</nav>
    </footer>
  </article>
  ${a.toc.length ? `<aside class="toc" aria-label="On this page"><div class="toc-inner"><p class="toc-title">On this page</p>${tocLinks}</div></aside>` : ''}
</div>`;
}

export function tagsView(ctx) {
  return `
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>Tags</span></nav>
<header class="page-head"><span class="cat-ico big" style="--c:#0ea5e9">${icon('tag')}</span><div><h1>Tags</h1><p class="lede">Every topic across the knowledge base.</p></div></header>
<div class="chips big">${ctx.tags.map((t) => `<a class="chip" href="/tags/${t.slug}/">${icon('tag')}${esc(t.name)}<span class="chip-n">${t.articles.length}</span></a>`).join('')}</div>`;
}

export function tagView(ctx, t) {
  return `
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/tags/">Tags</a><span>/</span><span>${esc(t.name)}</span></nav>
<header class="page-head"><span class="cat-ico big" style="--c:#0ea5e9">${icon('tag')}</span><div><h1>#${esc(t.name)}</h1><p class="lede">${count(t.articles.length, 'article')} tagged “${esc(t.name)}”.</p></div></header>
<div class="grid articles">${t.articles.map((a) => articleCard(ctx, a, { showCat: true })).join('')}</div>`;
}

export function notFoundView() {
  return `
<div class="empty">${icon('search')}<h3>Page not found</h3><p>That page doesn’t exist (yet). Try search or head back home.</p><a class="btn" href="/">Back to home</a></div>`;
}
