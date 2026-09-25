const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (char) => ESCAPES[char]!);

type Glossary = Record<string, { term: string; def: string }>;

/** Tooltip ids only have to be unique within one rendered page. */
let termSeq = 0;

/**
 * Copy in `src/i18n` is written as plain text with `backticks` around identifiers.
 * This turns those spans into <code> elements and escapes everything else, so the
 * i18n files stay readable and never carry raw markup.
 *
 * A `{{term-id}}` marker expands through the page glossary into a focusable inline
 * definition: the term itself plus a `role="tooltip"` description wired up with
 * `aria-describedby`, so it works for keyboard and screen-reader users too.
 */
export function inline(text: string, glossary?: Glossary): string {
  return text
    .split(/(`[^`]+`|\{\{[a-z0-9-]+\}\})/g)
    .map((part) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return `<code class="inline-code">${escapeHtml(part.slice(1, -1))}</code>`;
      }
      const marker = /^\{\{([a-z0-9-]+)\}\}$/.exec(part);
      if (marker) {
        const entry = glossary?.[marker[1]!];
        if (!entry) return escapeHtml(part);
        const id = `term-${marker[1]}-${++termSeq}`;
        return (
          `<span class="term" tabindex="0" aria-describedby="${id}">${escapeHtml(entry.term)}</span>` +
          `<span class="term-tip" role="tooltip" id="${id}">${escapeHtml(entry.def)}</span>`
        );
      }
      return escapeHtml(part);
    })
    .join('');
}
