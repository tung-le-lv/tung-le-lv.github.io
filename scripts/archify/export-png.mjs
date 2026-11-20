// Export diagrams/archify/<name>.html (built by Archify) to src/assets/img/<name>.png, using the viewer's own PNG export
// in the light theme. Usage: node scripts/archify/export-png.mjs [name ...]   (needs Google Chrome)
import { readdir, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const srcDir = path.join(root, 'diagrams', 'archify');
const outImg = path.join(root, 'src', 'assets', 'img');
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const only = process.argv.slice(2);
const names = (await readdir(srcDir))
  .filter((f) => f.endsWith('.html'))
  .map((f) => f.replace(/\.html$/, ''))
  .filter((n) => !only.length || only.includes(n));
if (!names.length) {
  console.error(`No matching .html files in ${path.relative(root, srcDir)}/`);
  process.exit(1);
}
await mkdir(outImg, { recursive: true });

const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
let failed = false;
try {
  for (const name of names) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    page.on('pageerror', (e) => console.error(`${name}: page error:`, e.message.slice(0, 300)));
    await page.evaluateOnNewDocument(() => {
      try { localStorage.setItem('archify-theme', 'light'); } catch (_) {}
      // Catch the viewer's download instead of letting the browser save it.
      const click = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function () {
        if (this.download && /\.png$/i.test(this.download)) { window.__exportHref = this.href; return; }
        return click.call(this);
      };
    });
    await page.goto(pathToFileURL(path.join(srcDir, `${name}.html`)).href, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    const hasButton = await page.evaluate(() => {
      const btn = document.querySelector('button[data-format="png"]');
      if (!btn) return false;
      btn.click();
      return true;
    });
    if (!hasButton) throw new Error(`${name}: no PNG export button in the viewer`);
    await page.waitForFunction(
      () => window.__exportHref || document.documentElement.getAttribute('data-last-export-error'),
      { timeout: 60000 },
    );
    const result = await page.evaluate(async () => {
      const error = document.documentElement.getAttribute('data-last-export-error');
      if (error) return { error };
      const blob = await (await fetch(window.__exportHref)).blob();
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let bin = '';
      for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      return { base64: btoa(bin) };
    });
    await page.close();
    if (result.error) { console.error(`${name}: export failed: ${result.error}`); failed = true; continue; }
    const out = path.join(outImg, `${name}.png`);
    await writeFile(out, Buffer.from(result.base64, 'base64'));
    console.log(`${name}: ${path.relative(root, out)} (${theme} theme)`);
  }
} finally {
  await browser.close();
}
if (failed) process.exit(1);
