import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'h1', 'h2', 'h3',
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'hr',
];

export const MAX_TITLE_LENGTH = 255;

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

/** Rich-text notes are stored as HTML, so strip everything except a safe whitelist. */
export const sanitizeContent = (html: string): string =>
  sanitizeHtml(html, { allowedTags: ALLOWED_TAGS, allowedAttributes: {} });

/**
 * Titles are plain text: remove all markup, turn escaped entities back into characters
 * (React escapes on render) and cap the length so it always fits the database column.
 */
export const sanitizeTitle = (title: string): string =>
  sanitizeHtml(title, { allowedTags: [], allowedAttributes: {} })
    .replace(/&(amp|lt|gt|quot|#39);/g, (entity) => ENTITIES[entity] ?? entity)
    .trim()
    .slice(0, MAX_TITLE_LENGTH);
