// Export every diagrams/src/*.mjs to diagrams/<name>.excalidraw (editable source) and src/assets/img/<name>.png.
// Usage: node scripts/excalidraw/export.mjs [name ...]     (needs Google Chrome and internet for the Excalidraw bundle)
import { createServer } from 'node:http';
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const srcDir = path.join(root, 'diagrams', 'src');
const outJson = path.join(root, 'diagrams');
const outImg = path.join(root, 'src', 'assets', 'img');
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const only = process.argv.slice(2);
const names = (await readdir(srcDir)).filter((f) => f.endsWith('.mjs')).map((f) => f.replace(/\.mjs$/, '')).filter((n) => !only.length || only.includes(n));
await mkdir(outImg, { recursive: true });

const server = createServer(async (_q, r) => { r.writeHead(200, { 'content-type': 'text/html' }); r.end(await readFile(path.join(here, 'harness.html'))); }).listen(0);
const port = server.address().port;
const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
const page = await browser.newPage();
page.on('pageerror', (e) => console.error('page error:', e.message.slice(0, 300)));
await page.goto(`http://localhost:${port}/`);
await page.waitForFunction('window.__ready === true', { timeout: 90000 });

// Warm up: the handwriting font (Excalifont) is only fetched when something is first drawn with it. If the elements are
// measured before that, text boxes come out too narrow and arrows are clipped/drawn through their labels.
await page.evaluate(async () => {
  const { convertToExcalidrawElements, exportToBlob } = window.__ex;
  const warm = convertToExcalidrawElements([{ type: 'text', x: 0, y: 0, text: 'warm up 0123456789 ABC abc', fontSize: 20 }]);
  await exportToBlob({ elements: warm, appState: { exportBackground: true }, files: null, mimeType: 'image/png' });
  await document.fonts.ready;
});

for (const name of names) {
  const mod = (await import(pathToFileURL(path.join(srcDir, `${name}.mjs`)).href + `?t=${Date.now()}`)).default;
  const { skeleton, scale = 2, padding = 32 } = await mod();
  const { png, json } = await page.evaluate(async (skeleton, scale, padding) => {
    const { convertToExcalidrawElements, exportToBlob, serializeAsJSON } = window.__ex;
    await document.fonts.ready;
    const elements = convertToExcalidrawElements(skeleton);
    const appState = { exportWithDarkMode: false, exportBackground: true, viewBackgroundColor: '#ffffff' };
    const blob = await exportToBlob({ elements, appState, files: null, mimeType: 'image/png', exportPadding: padding, getDimensions: (w, h) => ({ width: w * scale, height: h * scale, scale }) });
    const buf = new Uint8Array(await blob.arrayBuffer()); let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    return { png: btoa(s), json: serializeAsJSON(elements, appState, {}, 'local') };
  }, skeleton, scale, padding);
  await writeFile(path.join(outImg, `${name}.png`), Buffer.from(png, 'base64'));
  await writeFile(path.join(outJson, `${name}.excalidraw`), json);
  console.log(`exported ${name}: ${(png.length * 0.75 / 1024) | 0} KB`);
}
await browser.close();
server.close();
