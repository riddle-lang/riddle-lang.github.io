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

export interface Chapter {
  /** anchor id, e.g. "language" */
  id: string;
  /** short label in the sticky chapter nav */
  label: string;
  /** one line shown on the chapter divider */
  blurb: string;
}

export interface DiagnosticsCase {
  /** error code, e.g. "E0300" */
  code: string;
  /** one-line description of the mistake */
  title: string;
  /** the rendered diagnostic, verbatim from the compiler */
  output: string;
}

export interface DiagnosticsSection {
  eyebrow: string;
  title: string;
  subtitle: string;
  cases: DiagnosticsCase[];
  footnote: string;
  link: { label: string; href: string };
}

export interface InterpreterSection {
  eyebrow: string;
  title: string;
  subtitle: string;
  views: { label: string; lang: string; code: string }[];
  viewsCaption: string;
  run: { title: string; desc: string; code: string };
  repl: { title: string; desc: string; lines: string[]; caption: string };
  points: { title: string; desc: string }[];
}

export interface CompareSection {
  eyebrow: string;
  title: string;
  subtitle: string;
  head: [string, string, string, string, string];
  rows: [string, string, string, string, string][];
  blocks: { title: string; body: string }[];
  footnote: string;
  link: { label: string; href: string };
}

export interface WorkflowSection {
  eyebrow: string;
  title: string;
  subtitle: string;
  steps: { name: string; desc: string; code: string }[];
  points: string[];
}

export interface TargetsSection {
  eyebrow: string;
  title: string;
  subtitle: string;
  triples: { name: string; note: string }[];
  points: string[];
  footnote: string;
}

export interface HistorySection {
  eyebrow: string;
  title: string;
  subtitle: string;
  releases: { version: string; date: string; summary: string }[];
  footnote: string;
  link: { label: string; href: string };
}

export interface BenchmarksSection {
  eyebrow: string;
  title: string;
  subtitle: string;
  workloads: { name: string; desc: string }[];
  command: string;
  points: string[];
  footnote: string;
}

export interface FaqSection {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: { q: string; a: string }[];
}

export interface DocsSection {
  eyebrow: string;
  title: string;
  subtitle: string;
  groups: { title: string; items: { label: string; desc: string; href: string }[] }[];
  footnote: string;
}

export interface TermDefinition {
  term: string;
  def: string;
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
    /** accessible name for the sticky chapter rail */
    chapters: string;
  };
  nav: {
    /** In-page anchors; the chapter rail owns page navigation, so this is empty. */
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
      /** mono tag above the card title, e.g. "01 · 近期" */
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
  /** chapter rail: the sticky in-page navigation groups the sections below */
  chapters: Chapter[];
  diagnostics: DiagnosticsSection;
  interpreter: InterpreterSection;
  compare: CompareSection;
  workflow: WorkflowSection;
  targets: TargetsSection;
  history: HistorySection;
  benchmarks: BenchmarksSection;
  faq: FaqSection;
  docs: DocsSection;
  /** inline glossary used by `inline()` via {{id}} markers */
  glossary: Record<string, TermDefinition>;
}
