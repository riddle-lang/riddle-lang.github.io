/**
 * Dev-only DOM probe. Same CDP plumbing as `shot.mjs`, but instead of a
 * screenshot it evaluates an arbitrary expression against the loaded page.
 *
 *   node scripts/probe.mjs <url> <width> "<expression>"
 */
import { spawn } from 'node:child_process';

const [url = 'http://localhost:4321/', widthArg = '1440', expression = '1'] = process.argv.slice(2);
const width = Number(widthArg);
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9334;

const browser = spawn(
  EDGE,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}/riddle-cdp-probe`,
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
  height: 900,
  deviceScaleFactor: 1,
  mobile: width < 700,
});
await send('Page.enable');
await send('Page.navigate', { url });
await sleep(2500);

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
await sleep(600);

const result = await send('Runtime.evaluate', { expression, returnByValue: true });
console.log(
  typeof result.result.value === 'string'
    ? result.result.value
    : JSON.stringify(result.result.value, null, 2)
);

socket.close();
browser.kill();
