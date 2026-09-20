# Software Architect Wiki

Live site: https://tung-le-lv.github.io

## Run locally

```bash
npm install     # first time only
npm run dev     # build the site and serve it at http://localhost:4173
```

Open http://localhost:4173. Stop the server with `Ctrl+C`.

`npm run dev` does not watch for changes. After editing content, styles or scripts, stop it and run it again, or run `npm run build` in a second terminal and refresh the browser.

## Add an article

Just give markdown/pdf/word files.

## Diagrams (Excalidraw)

Article images are redrawn in Excalidraw, never copied from the source. Each diagram is a short script in `diagrams/src/`; `npm run diagrams` renders them with Excalidraw and writes:

- `diagrams/<name>.excalidraw` — the editable source (open it at https://excalidraw.com)
- `src/assets/img/<name>.png` — the image used in the article

Export one diagram with `npm run diagrams -- <name>`. It needs Google Chrome (set `CHROME_PATH` if it is not in the default macOS location) and an internet connection.

## Deploy to GitHub Pages

The site is deployed by GitHub Actions (`.github/workflows/deploy.yml`) on every push to `main`. It runs `npm ci` and `npm run build`, then publishes `dist/`.
