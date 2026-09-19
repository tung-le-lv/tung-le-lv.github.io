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

## Deploy to GitHub Pages

The site is deployed by GitHub Actions (`.github/workflows/deploy.yml`) on every push to `main`. It runs `npm ci` and `npm run build`, then publishes `dist/`.
