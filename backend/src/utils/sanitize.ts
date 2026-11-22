import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'h1', 'h2', 'h3',
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'hr',
];

export const MAX_TITLE_LENGTH = 255;

const ANGLE_BRACKETS = /[<>]/g;

/** Rich-text notes are stored as HTML, so strip everything except a safe whitelist. */
export const sanitizeContent = (html: string): string =>
  sanitizeHtml(html, { allowedTags: ALLOWED_TAGS, allowedAttributes: {} });

/**
 * Titles are plain text and can never contain markup: the API rejects "<" and ">" in titles
 * (see noteValidators), and this function removes them again as defence in depth. No tag
 * parsing is needed, characters are never escaped or decoded, and the result is idempotent,
 * so an exported title re-imports unchanged. Titles must still be rendered as text.
 */
export const sanitizeTitle = (title: string): string =>
  title.replace(ANGLE_BRACKETS, '').slice(0, MAX_TITLE_LENGTH).trim();
