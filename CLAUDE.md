# Software Architecture Wiki — static docs site

Static site for GitHub Pages. No backend. `npm run build` turns `content/**/*.md` into `dist/` (full HTML pages + `search.json` + sitemap); `npm run dev` builds and serves on :4173. `src/assets/` holds the CSS/JS; `scripts/build.mjs` + `scripts/templates.mjs` are the generator. CI (`.github/workflows/deploy.yml`) builds and deploys on push to `main`.

## Adding an article (Markdown / PDF / Word / Notion → page)
1. Convert the source to Markdown and save as `content/<category-slug>/<article-slug>.md`. Category folders must exist in `content/categories.json` (add a new entry there for a new category).
2. Front matter: `title` (required), `description`, `tags: [a, b]`, `updated: YYYY-MM-DD`, `section` (optional sidebar sub-category; nest with `Parent / Child`), `order` (number, lower first), `draft: true` to hide, `overview: true` for a hub/index page (kept out of the home page's Latest articles).
3. Body starts at `##` (the title is rendered from front matter). The TOC is generated from `##`/`###`; drop any Notion "table of contents" block.
4. Diagrams: fenced ```` ```mermaid ```` blocks. Code: fenced with a language.
5. Callouts: `> [!TIP] Title` (types: note, info, tip, warning, important, book), content on following `>` lines after a blank `>` line.
6. Tags describe topics only — never author or person names.
7. References: every source (book, article, link) goes in a dedicated `## References` section at the very end of the article as a bullet list (`Author, *Title* (Publisher, Year).` or `[Title — Site](url)`). Never show references in the header/meta line or as tags.
8. Images: never publish the original images from a source (Notion, books, blogs, screenshots). **Create new diagrams with Archify** (the `archify` skill in `.claude/skills/archify`) instead of redrawing or copying the source's figures: export each to PNG and use the exported image in the article. Use plain `![alt](/assets/img/name.png)` with descriptive alt text in your own words (do not copy the source caption). Prefer Mermaid for simple flows, and Archify for figure-style diagrams (architecture, workflow, sequence, data flow, lifecycle, ERD, class, tree, timeline, waterfall).
   - **How:** invoke the `archify` skill and describe what the diagram should show in your own words (no need to reproduce the source figure). Keep the typed source at `diagrams/archify/<name>.<type>.json` (editable, regenerate rather than hand-edit HTML) and build the HTML with `node .claude/skills/archify/bin/archify.mjs deliver <type> diagrams/archify/<name>.<type>.json diagrams/archify/<name>.html`. Open the HTML, use the viewer's image export (PNG) and save it as `src/assets/img/<name>.png`. Use the light theme for the exported PNG so it matches the site.
   - **Validate first:** `archify validate <type> <input.json>` and `archify check <output.html>` must pass before exporting. Fix layout warnings by reflowing, not by dropping labels.
   - **Labels must not be crossed by lines:** keep edge labels short; if a line touches a label, shorten the label or change the layout and re-run.
   - **Check every PNG by eye** before publishing: no overlapping text, no edge cutting through text, labels readable, nothing clipped.
   - The old Excalidraw pipeline (`diagrams/src/*.mjs`, `npm run diagrams`) is retired for new diagrams; existing `diagrams/*.excalidraw` files and PNGs stay as they are.
9. Strip internal/personal notes (names, "TODO" remarks) from Notion pages before publishing — the site is public.
10. Run `npm run build` to verify.

