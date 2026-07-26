/** 1.6px stroke on a 24x24 box — matches the hairline weight used across the page. */
export const ICON_PATHS = {
  move: '<path d="M4 12h16"/><path d="M14 6l6 6-6 6"/><rect x="2.5" y="8.5" width="7" height="7" rx="1.6"/>',
  escape:
    '<path d="M4 20h16"/><path d="M8 20V9.5"/><path d="M16 20v-6"/><path d="M12 3.5v7"/><path d="M9 6.5L12 3.5l3 3"/>',
  drop: '<path d="M12 3.5c3.4 3.6 5.2 6.2 5.2 8.6a5.2 5.2 0 1 1-10.4 0c0-2.4 1.8-5 5.2-8.6Z"/><path d="M9.6 12.6a2.6 2.6 0 0 0 2.4 3"/>',
  traits:
    '<circle cx="7.5" cy="7.5" r="3.5"/><circle cx="16.5" cy="16.5" r="3.5"/><path d="M14.5 4h5.5v5.5"/><path d="M20 4l-6 6"/><path d="M4 20l6-6"/>',
  match: '<path d="M4 6h4l3 6-3 6H4"/><path d="M20 6h-4"/><path d="M20 12h-6"/><path d="M20 18h-4"/>',
  ffi: '<rect x="2.5" y="5" width="8" height="14" rx="1.6"/><path d="M13.5 12h8"/><path d="M18 8.5l3.5 3.5-3.5 3.5"/><path d="M6.5 9.5v5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z"/>',
  menu: '<path d="M3.5 8h17M3.5 16h17"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  arrow: '<path d="M4 12h15"/><path d="M13 6l6 6-6 6"/>',
  external:
    '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 19V8a1.5 1.5 0 0 1 1.5-1.5H10"/>',
  github:
    '<path d="M9 19c-4.3 1.3-4.3-2.2-6-2.6m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 3.2 5.4 3.5 5.4 3.5a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.9c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
  copy: '<rect x="8.5" y="8.5" width="12" height="12" rx="2"/><path d="M5.5 15.5H5A1.5 1.5 0 0 1 3.5 14V5A1.5 1.5 0 0 1 5 3.5h9A1.5 1.5 0 0 1 15.5 5v.5"/>',
  check: '<path d="M4.5 12.5l5 5 10-11"/>',
  dot: '<circle cx="12" cy="12" r="4.5"/>',
} as const;

export type IconName = keyof typeof ICON_PATHS;
