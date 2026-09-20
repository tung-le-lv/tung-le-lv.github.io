# Software Architect Wiki — static docs site

Static site for GitHub Pages. No backend. `npm run build` turns `content/**/*.md` into `dist/` (full HTML pages + `search.json` + sitemap); `npm run dev` builds and serves on :4173. `src/assets/` holds the CSS/JS; `scripts/build.mjs` + `scripts/templates.mjs` are the generator. CI (`.github/workflows/deploy.yml`) builds and deploys on push to `main`.

## Adding an article (Markdown / PDF / Word / Notion → page)
1. Convert the source to Markdown and save as `content/<category-slug>/<article-slug>.md`. Category folders must exist in `content/categories.json` (add a new entry there for a new category).
2. Front matter: `title` (required), `description`, `tags: [a, b]`, `updated: YYYY-MM-DD`, `section` (optional sidebar sub-category; nest with `Parent / Child`), `order` (number, lower first), `draft: true` to hide.
3. Body starts at `##` (the title is rendered from front matter). The TOC is generated from `##`/`###`; drop any Notion "table of contents" block.
4. Diagrams: fenced ```` ```mermaid ```` blocks. Code: fenced with a language.
5. Callouts: `> [!TIP] Title` (types: note, info, tip, warning, important, book), content on following `>` lines after a blank `>` line.
6. Tags describe topics only — never author or person names.
7. References: every source (book, article, link) goes in a dedicated `## References` section at the very end of the article as a bullet list (`Author, *Title* (Publisher, Year).` or `[Title — Site](url)`). Never show references in the header/meta line or as tags.
8. Images: never publish the original images from a source (Notion, books, blogs, screenshots). **Redraw every image in Excalidraw**, export it to PNG, and use the exported image in the article. Draw it as a small script in `diagrams/src/<name>.mjs` using the helpers in `scripts/excalidraw/dsl.mjs` (box, frame, db, arrow, tag, note, badge), then run `npm run diagrams` (needs Google Chrome and internet). That writes the editable `diagrams/<name>.excalidraw` and the exported `src/assets/img/<name>.png`. Look at the PNG and fix overlapping labels before publishing. Use plain `![alt](/assets/img/name.png)` with descriptive alt text. Prefer Mermaid for simple flows, and Excalidraw when the source image is a hand-drawn or figure-style diagram.
9. Strip internal/personal notes (names, "TODO" remarks) from Notion pages before publishing — the site is public.
10. Run `npm run build` to verify.

