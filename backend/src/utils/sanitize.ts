import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'h1', 'h2', 'h3',
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'hr',
];

export const MAX_TITLE_LENGTH = 255;

const TAG_PATTERN = /<[^>]*>/g;

/** Rich-text notes are stored as HTML, so strip everything except a safe whitelist. */
export const sanitizeContent = (html: string): string =>
  sanitizeHtml(html, { allowedTags: ALLOWED_TAGS, allowedAttributes: {} });

/**
 * Titles are plain text. Markup is removed and the length is capped, but characters are never
 * escaped or decoded, so the result is a fixed point: cleaning an already clean title (for
 * example one that was exported and is now imported again) returns it unchanged.
 * Titles must be rendered as text (React escapes them), never as HTML.
 */
export const sanitizeTitle = (title: string): string => {
  let result = title;
  let previous: string;
  do {
    previous = result;
    result = result.replace(TAG_PATTERN, '');
  } while (result !== previous);
  return result.slice(0, MAX_TITLE_LENGTH).trim();
};