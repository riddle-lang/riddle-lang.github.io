export type Locale = 'zh' | 'en';

export interface Feature {
  /** stable id, used for tab ids / aria wiring */
  id: string;
  /** short label in the left rail */
  title: string;
  /** one line under the label in the left rail */
  summary: string;
  /** big headline inside the panel */
  headline: string;
  /** supporting paragraph inside the panel */
  body: string;
  /** riddle source shown in the panel */
  code: string;
  /** caption printed under the code block */
  caption?: string;
  /** optional bullet list */
  bullets?: string[];
  /** optional small table (escape-analysis allocation matrix) */
  table?: { head: [string, string]; rows: [string, string][] };
}

export interface ToolchainEntry {
  name: string;
  tagline: string;
  desc: string;
  /** rendered as a mono usage line, not inline in the prose */
  usage?: string;
  points: string[];
}

export interface SiteContent {
  locale: Locale;
  htmlLang: string;
  dir: {
    /** href of this page */
    self: string;
    /** href of the other language */
    other: string;
    /** label of the other language, e.g. "EN" */
    otherLabel: string;
    otherTitle: string;
  };
  meta: {
    title: string;
    description: string;
    ogAlt: string;
  };
  a11y: {
    skipToContent: string;
    toggleTheme: string;
    openMenu: string;
    closeMenu: string;
    copy: string;
    copied: string;
  };
  nav: {
    links: { label: string; href: string }[];
    docs: string;
    playground: string;
    github: string;
  };
  hero: {
    badge: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    codeFile: string;
    code: string;
    stats: { value: string; label: string }[];
  };
  features: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: Feature[];
  };
  pipeline: {
    eyebrow: string;
    title: string;
    subtitle: string;
    stages: { name: string; desc: string }[];
    footnote: string;
  };
  runtime: {
    eyebrow: string;
    title: string;
    subtitle: string;
    code: string;
    caption: string;
    points: { title: string; desc: string }[];
  };
  release: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: { title: string; desc: string }[];
  };
  toolchain: {
    eyebrow: string;
    title: string;
    subtitle: string;
    /** the version manager, rendered as a wide card above the components */
    manager: ToolchainEntry & { link: { label: string; href: string } };
    items: ToolchainEntry[];
  };
  editors: {
    eyebrow: string;
    title: string;
    subtitle: string;
    list: string[];
    haveTitle: string;
    have: string[];
    missTitle: string;
    miss: string[];
  };
  quickstart: {
    eyebrow: string;
    title: string;
    subtitle: string;
    steps: { title: string; desc: string; code: string; lang: string }[];
    footnote: string;
  };
  status: {
    eyebrow: string;
    title: string;
    subtitle: string;
    worksTitle: string;
    works: string[];
    limitsTitle: string;
    limits: string[];
    note: string;
  };
  roadmap: {
    eyebrow: string;
    title: string;
    subtitle: string;
    phases: {
      /** mono tag above the card title, e.g. "v0.2 · 近期" */
      tag: string;
      title: string;
      desc: string;
      items: string[];
    }[];
    note: string;
  };
  author: {
    eyebrow: string;
    title: string;
    name: string;
    role: string;
    /** the author's GitHub bio, shown verbatim as a mono chip */
    motto: string;
    bio: string[];
    link: { label: string; href: string };
  };
  cta: {
    title: string;
    subtitle: string;
    primary: string;
    secondary: string;
  };
  footer: {
    tagline: string;
    groups: { title: string; links: { label: string; href: string }[] }[];
    license: string;
    community: string;
    communityValue: string;
    copyright: string;
  };
}
