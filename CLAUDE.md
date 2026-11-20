# Software Architecture Wiki — static docs site

Static site for GitHub Pages. No backend. `npm run build` turns `content/**/*.md` into `dist/` (full HTML pages + `search.json` + sitemap); `npm run dev` builds and serves on :4173. `src/assets/` holds the CSS/JS; `scripts/build.mjs` + `scripts/templates.mjs` are the generator. CI (`.github/workflows/deploy.yml`) builds and deploys on push to `main`.

## Adding an article (Markdown / PDF / Word / Notion → page)
1. Convert the source to Markdown and save as `content/<category-slug>/<article-slug>.md`. Category folders must exist in `content/categories.json` (add a new entry there for a new category).
2. Front matter: `title` (required), `tags: [a, b]`, `updated: YYYY-MM-DD`, `section` (optional sidebar sub-category; nest with `Parent / Child`), `order` (number, lower first), `draft: true` to hide, `overview: true` for a hub/index page (kept out of the home page's Latest articles).
3. Body starts at `##` (the title is rendered from front matter). The TOC is generated from `##`/`###`; drop any Notion "table of contents" block.
   - **No summary at the top.** Never add a `description` to the front matter: it is rendered as a summary paragraph under the title. Never open the article with a summary block either: no "The short version" / TL;DR callout or section. Start straight into the content.
4. Diagrams: fenced ```` ```mermaid ```` blocks. Code: fenced with a language.
5. Callouts: `> [!TIP] Title` (types: note, info, tip, warning, important, book), content on following `>` lines after a blank `>` line.
6. Tags describe topics only — never author or person names.
7. References: every source (book, article, link) goes in a dedicated `## References` section at the very end of the article as a bullet list (`Author, *Title* (Publisher, Year).` or `[Title — Site](url)`). Never show references in the header/meta line or as tags.
8. Images: never publish the original images from a source (Notion, books, blogs, screenshots). **Create new diagrams with Archify** (the `archify` skill in `.claude/skills/archify`) instead of redrawing or copying the source's figures, and embed the live (animated) diagram in the article with an `archify` block. Write the description in your own words (do not copy the source caption). Prefer Mermaid for simple flows, and Archify for figure-style diagrams (architecture, workflow, sequence, data flow, lifecycle, ERD, class, tree, timeline, waterfall).
   - **How:** invoke the `archify` skill and describe what the diagram should show in your own words (no need to reproduce the source figure). Keep the typed source at `diagrams/archify/<name>.<type>.json` (editable; regenerate rather than hand-edit HTML) with `meta.output` set to `diagrams/archify/<name>.html`, then build it with `node .claude/skills/archify/bin/archify.mjs finalize <type> diagrams/archify/<name>.<type>.json diagrams/archify/<name>.html --quality showcase --json`. `finalize` runs validate, deliver, check and a browser check; it must pass before embedding. Fix layout warnings by reflowing, not by dropping labels.
   - **Embed:** a fenced block whose first line is the diagram name and whose remaining lines are the description for screen readers:
     ````
     ```archify
     <name>
     <one or two sentences describing what the diagram shows>
     ```
     ````
     The build copies `diagrams/archify/<name>.html` to `dist/assets/archify/` and shows it in an iframe with the viewer's toolbar and cards hidden and the theme following the site's. Motion starts Still (Archify's default); readers switch to Live in the full viewer, which the magnifier (zoom) button below the diagram opens in a popup, and Archify remembers that choice. Archify's own `?embed=1` mode never animates, so don't use it.
   - **Commit** the `.json` source and the `.html`; the run receipts (`*.finalize*.json`, `*.browser-check.json`, `*.delivery.json`) are git-ignored because they hold local paths.
   - **Static PNG (optional):** only when a still image is needed, `npm run archify:png -- <name>` uses the viewer's own PNG export in the light theme and writes `src/assets/img/<name>.png`.
   - **Labels must not be crossed by lines:** keep edge labels short; if a line touches a label, shorten the label or change the layout and re-run.
   - **Check the diagram by eye** in `npm run dev`, in light and dark, before publishing: no overlapping text, no edge cutting through text, labels readable at the article width, nothing clipped. Keep diagrams compact; the article column is about 710px wide, so a very wide diagram gets small text.
   - The old Excalidraw pipeline (`diagrams/src/*.mjs`, `npm run diagrams`) is retired for new diagrams; existing `diagrams/*.excalidraw` files and PNGs stay as they are.
9. Strip internal/personal notes (names, "TODO" remarks) from Notion pages before publishing — the site is public.
10. Run `npm run build` to verify.

