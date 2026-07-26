/**
 * Dev-only visual check. Drives headless Edge over CDP to take a full-page
 * screenshot at a given width and colour scheme, and reports any element that
 * overflows the layout viewport horizontally.
 *
 *   node scripts/shot.mjs <url> <width> <dark|light> <out.png>
 *
 * Requires `npm run preview` (or `npm run dev`) to be serving the URL.
 */
import { spawn } from 'node:child_process';
import sharp from 'sharp';

/** Viewport height, and therefore the height of one capture tile. */
const TILE = 900;

const [url = 'http://localhost:4321/', widthArg = '1440', scheme = 'dark', out = 'shot.png'] =
  process.argv.slice(2);

const width = Number(widthArg);
const mobile = width < 700;
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9333;

const browser = spawn(
  EDGE,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}/riddle-cdp`,
    'about:blank',
  ],
  { stdio: 'ignore' }
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let target = null;
for (let attempt = 0; attempt < 40 && !target; attempt += 1) {
  await sleep(400);
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    target = list.find((entry) => entry.type === 'page' && entry.webSocketDebuggerUrl);
  } catch {
    /* not listening yet */
  }
}

if (!target) {
  browser.kill();
  throw new Error('could not attach to Edge');
}

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve) => socket.addEventListener('open', resolve));

let nextId = 1;
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = nextId++;
    const onMessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id !== id) return;
      socket.removeEventListener('message', onMessage);
      if (message.error) reject(new Error(`${method}: ${message.error.message}`));
      else resolve(message.result);
    };
    socket.addEventListener('message', onMessage);
    socket.send(JSON.stringify({ id, method, params }));
  });

await send('Emulation.setDeviceMetricsOverride', {
  width,
  height: TILE,
  deviceScaleFactor: 1,
  mobile,
});
await send('Emulation.setEmulatedMedia', {
  features: [{ name: 'prefers-color-scheme', value: scheme }],
});
await send('Page.enable');
await send('Page.navigate', { url });
await sleep(2500);

// Scroll through the page so every IntersectionObserver reveal fires.
const height = (
  await send('Runtime.evaluate', {
    expression: 'document.documentElement.scrollHeight',
    returnByValue: true,
  })
).result.value;

for (let y = 0; y < height; y += 600) {
  await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${y})` });
  await sleep(90);
}
await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0)' });
await sleep(700);

const report = await send('Runtime.evaluate', {
  returnByValue: true,
  expression: `(() => {
    const view = document.documentElement.clientWidth;
    const wide = [...document.querySelectorAll('*')]
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.width > view + 1 || r.right > view + 1)
      .sort((a, b) => b.r.width - a.r.width)
      .slice(0, 8)
      .map(({ el, r }) => el.tagName.toLowerCase() + '.' + (el.getAttribute('class') || '').split(' ').slice(0, 3).join('.') + ' w=' + Math.round(r.width));
    return JSON.stringify({ view, scrollWidth: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, wide });
  })()`,
});
console.log(report.result.value);

// Tile the page one viewport at a time. Neither `captureBeyondViewport` nor a
// document-tall viewport is reliable here: both leave the bottom of a long page
// unrastered, so the tail comes back blank.
await send('Runtime.evaluate', {
  expression: `(() => {
    // The page scrolls smoothly, so a tile would be captured somewhere between
    // two scroll positions — double-exposed text and grey seams.
    document.documentElement.style.scrollBehavior = 'auto';
    // Sticky boxes travel with the scroll, so they would appear once per tile.
    for (const el of document.querySelectorAll('*')) {
      if (getComputedStyle(el).position === 'sticky') el.style.position = 'static';
    }
    // Settle every reveal so a tile can never catch one mid-transition.
    for (const el of document.querySelectorAll('.reveal')) el.classList.add('is-in');
  })()`,
});
await sleep(400);

const tiles = [];
for (let y = 0; y < height; y += TILE) {
  await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${y})` });
  await sleep(260);
  const at = (
    await send('Runtime.evaluate', { expression: 'window.scrollY', returnByValue: true })
  ).result.value;
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const top = Math.round(at);
  let input = Buffer.from(shot.data, 'base64');
  if (top + TILE > height) {
    input = await sharp(input).extract({ left: 0, top: 0, width, height: height - top }).toBuffer();
  }
  tiles.push({ input, top, left: 0 });
}

await sharp({ create: { width, height, channels: 3, background: '#808080' } })
  .composite(tiles)
  .png()
  .toFile(out);
console.log('wrote', out, `${width}x${height}`, `${tiles.length} tiles`);

socket.close();
browser.kill();
