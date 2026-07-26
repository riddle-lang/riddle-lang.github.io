// @ts-check
import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

import riddleGrammar from './src/data/riddle.tmLanguage.json' with { type: 'json' };

// The author avatar is fetched by GitHub user id (rename-proof); s=192 covers
// the 96px render at 2x DPI.
const AVATAR_URL = 'https://avatars.githubusercontent.com/u/134853769?v=4&s=192';
const AVATAR_PATH = fileURLToPath(new URL('./public/author.png', import.meta.url));

/** @returns {import('astro').AstroIntegration} */
const fetchAuthorAvatar = () => ({
  name: 'fetch-author-avatar',
  hooks: {
    'astro:build:start': async ({ logger }) => {
      try {
        const res = await fetch(AVATAR_URL, { signal: AbortSignal.timeout(10_000) });
        if (!res.ok || !res.headers.get('content-type')?.startsWith('image/'))
          throw new Error(`unexpected response: ${res.status}`);
        await writeFile(AVATAR_PATH, Buffer.from(await res.arrayBuffer()));
        logger.info('refreshed public/author.png');
      } catch (error) {
        // A failed fetch must not break offline builds: the committed
        // author.png serves as the fallback. Only a missing file is fatal.
        if (!existsSync(AVATAR_PATH)) throw error;
        logger.warn(`avatar fetch failed, keeping committed fallback (${/** @type {Error} */ (error).message})`);
      }
    },
  },
});

export default defineConfig({
  site: 'https://riddle-lang.github.io',
  base: '/',
  trailingSlash: 'ignore',
  build: {
    inlineStylesheets: 'auto',
  },
  integrations: [
    fetchAuthorAvatar(),
    sitemap({
      i18n: {
        defaultLocale: 'zh',
        locales: { zh: 'zh-CN', en: 'en' },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      themes: {
        dark: 'github-dark-default',
        light: 'github-light-default',
      },
      langs: [/** @type {any} */ (riddleGrammar)],
      wrap: false,
    },
  },
});
