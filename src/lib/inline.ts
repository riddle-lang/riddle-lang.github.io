const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (char) => ESCAPES[char]!);

/**
 * Copy in `src/i18n` is written as plain text with `backticks` around identifiers.
 * This turns those spans into <code> elements and escapes everything else, so the
 * i18n files stay readable and never carry raw markup.
 */
export function inline(text: string): string {
  return text
    .split(/(`[^`]+`)/g)
    .map((part) =>
      part.startsWith('`') && part.endsWith('`') && part.length > 2
        ? `<code class="inline-code">${escapeHtml(part.slice(1, -1))}</code>`
        : escapeHtml(part)
    )
    .join('');
}
