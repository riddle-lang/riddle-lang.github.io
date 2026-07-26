/**
 * Rasterises the social card and the apple-touch icon from the brand SVG.
 * Run with `node scripts/generate-images.mjs` after changing the logo or tagline;
 * the results are committed under `public/`.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const publicDir = new URL('public/', root);

const MARK = `
  <g transform="translate(0,0) scale(1)">
    <path transform="rotate(152 135 128)" stroke-linecap="round" stroke-width="16"
      stroke="url(#g)" fill="none" d="m140,118l-10,0m10,20l-10,0"/>
    <circle opacity="0.2" fill="url(#g)" r="90" cy="100" cx="100"/>
    <path stroke-linejoin="round" stroke-linecap="round" stroke-width="16" stroke="url(#g)" fill="none"
      d="m70,50l0,100m0,-100c0,0 60,0 60,30c0,30 -60,30 -60,30m40,0l20,40"/>
  </g>`;

const GRADIENT = `
  <linearGradient id="g" x1="-0.05556" y1="-0.05556" x2="1.05556" y2="1.05556">
    <stop stop-color="#005670"/>
    <stop stop-color="#00A1D6" offset="1"/>
  </linearGradient>`;

const FONT = "'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    ${GRADIENT}
    <radialGradient id="glow" cx="50%" cy="18%" r="62%">
      <stop offset="0%" stop-color="#00A1D6" stop-opacity="0.26"/>
      <stop offset="100%" stop-color="#00A1D6" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0A0A0B"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g transform="translate(96,150) scale(0.86)">${MARK}</g>
  <text x="290" y="248" font-family="${FONT}" font-size="104" font-weight="600"
    fill="#E8E8ED" letter-spacing="-3">Riddle</text>
  <text x="292" y="316" font-family="${FONT}" font-size="34" font-weight="500"
    fill="#00A1D6" letter-spacing="-0.4">Memory safety, without the GC tax.</text>
  <rect x="96" y="404" width="1008" height="1" fill="#26262A"/>
  <text x="96" y="466" font-family="${FONT}" font-size="27" fill="#98989D">
    Move semantics · Escape analysis · Deterministic Drop · C11 backend
  </text>
  <text x="96" y="520" font-family="${FONT}" font-size="24" fill="#6E6E73">
    riddle-lang.github.io
  </text>
</svg>`;

await sharp(Buffer.from(og)).png().toFile(fileURLToPath(new URL('og.png', publicDir)));

const favicon = await readFile(fileURLToPath(new URL('favicon.svg', publicDir)));
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 200 200">
  <defs>${GRADIENT}</defs>
  <rect width="200" height="200" rx="44" fill="#0A0A0B"/>
  <g transform="translate(14,14) scale(0.86)">${MARK}</g>
</svg>`;

await sharp(Buffer.from(icon))
  .resize(180, 180)
  .png()
  .toFile(fileURLToPath(new URL('apple-touch-icon.png', publicDir)));

void favicon;
console.log('wrote public/og.png and public/apple-touch-icon.png');
