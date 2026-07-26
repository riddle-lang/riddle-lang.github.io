import type { Locale, SiteContent } from './types';
import { zh } from './zh';
import { en } from './en';

export const content: Record<Locale, SiteContent> = { zh, en };

export type { Locale, SiteContent };
export * from './types';
