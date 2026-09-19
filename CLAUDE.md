# Software Architect Wiki — static docs site

Static site for GitHub Pages. No backend. `npm run build` turns `content/**/*.md` into `dist/` (full HTML pages + `search.json` + sitemap); `npm run dev` builds and serves on :4173. `src/assets/` holds the CSS/JS; `scripts/build.mjs` + `scripts/templates.mjs` are the generator. CI (`.github/workflows/deploy.yml`) builds and deploys on push to `main`.

## Adding an article (Markdown / PDF / Word / Notion → page)
1. Convert the source to Markdown and save as `content/<category-slug>/<article-slug>.md`. Category folders must exist in `content/categories.json` (add a new entry there for a new category).
2. Front matter: `title` (required), `description`, `tags: [a, b]`, `updated: YYYY-MM-DD`, `section` (optional sidebar group), `order` (number, lower first), `source` + `sourceTitle` (optional attribution link), `draft: true` to hide.
3. Body starts at `##` (the title is rendered from front matter). The TOC is generated from `##`/`###`; drop any Notion "table of contents" block.
4. Diagrams: fenced ```` ```mermaid ```` blocks. Code: fenced with a language.
5. Callouts: `> [!TIP] Title` (types: note, info, tip, warning, important, book), content on following `>` lines after a blank `>` line.
6. Strip internal/personal notes (names, "TODO" remarks) from Notion pages before publishing — the site is public.
7. Run `npm run build` to verify.
