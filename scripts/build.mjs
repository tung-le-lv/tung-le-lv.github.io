// Static site generator: content/**/*.md  ->  dist/**/index.html (+ search.json, sitemap.xml)
import { readFile, writeFile, mkdir, rm, cp, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { Marked } from 'marked';
import hljs from 'highlight.js';
import { page, articleView, categoryView, homeView, tagsView, tagView, notFoundView, esc, icon } from './templates.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(ROOT, 'content');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

export const slugify = (s) =>
  s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section';

const stripTags = (h) => h.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

// ---------- Markdown ----------
const CALLOUTS = new Set(['note', 'info', 'tip', 'warning', 'important', 'book']);
const CALLOUT_LABEL = { note: 'Note', info: 'Info', tip: 'Tip', warning: 'Warning', important: 'Important', book: 'Reference' };

function renderMarkdown(md) {
  const toc = [];
  const seen = new Map();
  let hasMermaid = false;

  const marked = new Marked({ gfm: true, breaks: false });
  marked.use({
    renderer: {
      heading({ tokens, depth }) {
        const html = this.parser.parseInline(tokens);
        const text = stripTags(html);
        let id = slugify(text);
        const n = seen.get(id) ?? 0;
        seen.set(id, n + 1);
        if (n) id += `-${n}`;
        if (depth === 2 || depth === 3) toc.push({ depth, id, text });
        return `<h${depth} id="${id}">${html}<a class="anchor" href="#${id}" aria-label="Link to this section">#</a></h${depth}>\n`;
      },
      code({ text, lang }) {
        const language = (lang || '').trim().split(/\s+/)[0].toLowerCase();
        if (language === 'mermaid') {
          hasMermaid = true;
          return `<figure class="diagram"><pre class="mermaid" data-src="${esc(text)}">${esc(text)}</pre></figure>\n`;
        }
        const ok = language && hljs.getLanguage(language);
        const body = ok ? hljs.highlight(text, { language }).value : esc(text);
        const label = language ? esc(language === 'csharp' || language === 'c#' ? 'C#' : language) : 'text';
        return `<div class="code"><div class="code-head"><span>${label}</span><button type="button" class="copy" aria-label="Copy code">Copy</button></div><pre><code class="hljs${ok ? ` language-${language}` : ''}">${body}</code></pre></div>\n`;
      },
      blockquote({ tokens }) {
        let html = this.parser.parse(tokens);
        const m = html.match(/^\s*<p>\[!(\w+)\](?:[ \t]+([^\n]*?))?(<\/p>\n?|\n)/);
        if (m && CALLOUTS.has(m[1].toLowerCase())) {
          const type = m[1].toLowerCase();
          const title = m[2]?.trim() || CALLOUT_LABEL[type];
          let rest = html.slice(m[0].length);
          if (m[3] === '\n') rest = `<p>${rest}`;
          return `<aside class="callout callout-${type}" role="note"><div class="callout-title">${icon(type)}<span>${title}</span></div><div class="callout-body">${rest}</div></aside>\n`;
        }
        return `<blockquote>${html}</blockquote>\n`;
      },
      table(token) {
        const header = token.header.map((c, i) => `<th${token.align[i] ? ` style="text-align:${token.align[i]}"` : ''}>${this.parser.parseInline(c.tokens)}</th>`).join('');
        const rows = token.rows.map((r) => `<tr>${r.map((c, i) => `<td${token.align[i] ? ` style="text-align:${token.align[i]}"` : ''}>${this.parser.parseInline(c.tokens)}</td>`).join('')}</tr>`).join('');
        return `<div class="table-wrap"><table><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></div>\n`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const external = /^https?:\/\//i.test(href);
        return `<a href="${esc(href)}"${title ? ` title="${esc(title)}"` : ''}${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>`;
      },
    },
  });
  const html = marked.parse(md);
  return { html, toc, hasMermaid, text: stripTags(html).replace(/\s+/g, ' ').trim() };
}

// Raw HTML articles: body is used as-is; headings that carry an id feed the TOC.
function renderRawHtml(html) {
  const toc = [...html.matchAll(/<h([23])\b[^>]*\bid="([^"]+)"[^>]*>(.*?)<\/h\1>/gs)]
    .map((m) => ({ depth: Number(m[1]), id: m[2], text: stripTags(m[3]) }));
  const text = stripTags(html.replace(/<svg[\s\S]*?<\/svg>/g, ' ')).replace(/\s+/g, ' ').trim();
  return { html, toc, hasMermaid: false, text };
}

// ---------- Load content ----------
async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (e.name.endsWith('.md') || e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const fmtDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

async function loadSite() {
  const site = JSON.parse(await readFile(path.join(CONTENT, 'site.json'), 'utf8'));
  const categories = JSON.parse(await readFile(path.join(CONTENT, 'categories.json'), 'utf8'));
  const bySlug = new Map(categories.map((c) => [c.slug, { ...c, articles: [] }]));
  const tags = new Map();

  for (const file of await walk(CONTENT)) {
    const rel = path.relative(CONTENT, file).split(path.sep);
    const [catSlug] = rel;
    const cat = bySlug.get(catSlug);
    if (!cat) throw new Error(`${rel.join('/')}: folder "${catSlug}" is not declared in content/categories.json`);
    const { data, content } = matter(await readFile(file, 'utf8'));
    if (!data.title) throw new Error(`${rel.join('/')}: missing "title" in front matter`);
    const slug = slugify(path.basename(file).replace(/\.(md|html)$/, ''));
    const raw = file.endsWith('.html'); // hand-authored/imported HTML article (front matter: layout: raw)
    const rendered = raw ? renderRawHtml(content) : renderMarkdown(content);
    const words = rendered.text.split(' ').length;
    const article = {
      title: data.title,
      description: data.description || '',
      tags: (data.tags || []).map(String),
      updated: fmtDate(data.updated ?? data.date),
      section: data.section || '',
      order: data.order ?? 1000,
      draft: !!data.draft,
      overview: !!data.overview, // hub/index page: kept out of the home page's "Latest articles"
      raw,
      slug,
      category: cat,
      url: `/${cat.slug}/${slug}/`,
      readingMinutes: Math.max(1, Math.round(words / 220)),
      ...rendered,
    };
    if (article.draft) continue;
    cat.articles.push(article);
    for (const t of article.tags) {
      const ts = slugify(t);
      if (!tags.has(ts)) tags.set(ts, { slug: ts, name: t, articles: [] });
      tags.get(ts).articles.push(article);
    }
  }

  for (const cat of bySlug.values()) {
    cat.articles.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
    // Nested sub-categories: front matter `section: "Parent / Child"`. Children appear in the order
    // of their first (lowest-`order`) article; articles with no section come first.
    const root = { name: '', path: [], articles: [], children: [] };
    for (const a of cat.articles) {
      a.path = a.section ? a.section.split('/').map((p) => p.trim()).filter(Boolean) : [];
      let node = root;
      for (const name of a.path) {
        let child = node.children.find((c) => c.name === name);
        if (!child) node.children.push((child = { name, path: [...node.path, name], articles: [], children: [] }));
        node = child;
      }
      node.articles.push(a);
    }
    const flatten = (n) => [...n.articles, ...n.children.flatMap(flatten)];
    cat.tree = root;
    cat.articles = flatten(root); // navigation order = display order
  }
  const all = [...bySlug.values()].flatMap((c) => c.articles).sort((a, b) => b.updated.localeCompare(a.updated));
  return { site, categories: [...bySlug.values()], tags: [...tags.values()].sort((a, b) => b.articles.length - a.articles.length || a.name.localeCompare(b.name)), all };
}

// ---------- Emit ----------
async function emit(file, html) {
  const out = path.join(DIST, file);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, html);
}

async function assetVersion() {
  const h = createHash('sha1');
  for (const f of ['style.css', 'dict.css', 'app.js']) h.update(await readFile(path.join(SRC, 'assets', f)));
  return h.digest('hex').slice(0, 8);
}

async function main() {
  const data = await loadSite();
  const v = await assetVersion();
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });
  await cp(path.join(SRC, 'assets'), path.join(DIST, 'assets'), { recursive: true });
  await writeFile(path.join(DIST, '.nojekyll'), '');

  const ctx = { ...data, v };
  const render = (opts) => page(ctx, opts);

  await emit('index.html', render({ path: '/', title: data.site.title, description: data.site.description, body: homeView(ctx), kind: 'home' }));
  await emit('404.html', render({ path: '/404.html', title: `Not found · ${data.site.title}`, description: 'Page not found', body: notFoundView(ctx), kind: 'notfound', noindex: true }));
  await emit('tags/index.html', render({ path: '/tags/', title: `Tags · ${data.site.title}`, description: 'Browse articles by tag', body: tagsView(ctx), kind: 'tags' }));

  for (const t of data.tags) {
    await emit(`tags/${t.slug}/index.html`, render({ path: `/tags/${t.slug}/`, title: `#${t.name} · ${data.site.title}`, description: `Articles tagged ${t.name}`, body: tagView(ctx, t), kind: 'tags' }));
  }
  for (const cat of data.categories) {
    await emit(`${cat.slug}/index.html`, render({ path: `/${cat.slug}/`, title: `${cat.title} · ${data.site.title}`, description: cat.description, body: categoryView(ctx, cat), kind: 'category', cat }));
    cat.articles.forEach((a, i) => {
      a.prev = cat.articles[i - 1];
      a.next = cat.articles[i + 1];
    });
    for (const a of cat.articles) {
      await emit(`${cat.slug}/${a.slug}/index.html`, render({ path: a.url, title: `${a.title} · ${data.site.title}`, description: a.description, body: articleView(ctx, a), kind: 'article', cat, article: a }));
    }
  }

  // search index
  const search = data.all.map((a) => ({
    t: a.title, d: a.description, u: a.url, c: a.category.title, k: a.category.color,
    g: a.tags, h: a.toc.map((x) => x.text), x: a.text.slice(0, 4000),
  }));
  await emit('search.json', JSON.stringify(search));

  // sitemap + robots
  const urls = ['/', '/tags/', ...data.categories.map((c) => `/${c.slug}/`), ...data.all.map((a) => a.url), ...data.tags.map((t) => `/tags/${t.slug}/`)];
  await emit('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${data.site.url}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
  await emit('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${data.site.url}/sitemap.xml\n`);

  console.log(`Built ${data.all.length} articles, ${data.categories.length} categories, ${data.tags.length} tags -> dist/`);
}

main().catch((e) => { console.error(e); process.exit(1); });
