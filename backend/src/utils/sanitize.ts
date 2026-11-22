import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'h1', 'h2', 'h3',
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'hr',
];

/** Rich-text notes are stored as HTML, so strip everything except a safe whitelist. */
export const sanitizeContent = (html: string): string =>
  sanitizeHtml(html, { allowedTags: ALLOWED_TAGS, allowedAttributes: {} });

export const sanitizeTitle = (title: string): string =>
  sanitizeHtml(title, { allowedTags: [], allowedAttributes: {} }).trim();
