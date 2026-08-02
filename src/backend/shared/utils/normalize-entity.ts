/**
 * Normalizes entity names using conservative deterministic rules.
 * - Unicode NFC normalization
 * - Lowercase conversion
 * - Trims leading/trailing whitespace
 * - Collapses internal whitespace sequences into a single space
 * - Preserves punctuation, hyphens, and symbols
 */
export function normalizeEntityName(raw: string | null | undefined): string {
  if (!raw) {
    return '';
  }

  const normalized = raw
    .normalize('NFC')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

  return normalized;
}

/**
 * Normalizes website domain names conservatively.
 * - Lowercase conversion
 * - Trims whitespace
 * - Strips http:// or https:// schemes
 * - Strips www. prefix if present at start of hostname
 * - Strips paths, query params, hash fragments, and trailing slashes
 * - PRESERVES subdomains (e.g. shop.acme.com remains shop.acme.com)
 */
export function normalizeDomain(raw: string | null | undefined): string {
  if (!raw || typeof raw !== 'string') {
    return '';
  }

  let cleaned = raw.trim().toLowerCase();
  if (cleaned === '') {
    return '';
  }

  // Strip scheme if present
  cleaned = cleaned.replace(/^https?:\/\//i, '');

  // Strip path, query params, and hash fragments
  const firstSlashIndex = cleaned.indexOf('/');
  if (firstSlashIndex !== -1) {
    cleaned = cleaned.substring(0, firstSlashIndex);
  }

  const questionMarkIndex = cleaned.indexOf('?');
  if (questionMarkIndex !== -1) {
    cleaned = cleaned.substring(0, questionMarkIndex);
  }

  const hashIndex = cleaned.indexOf('#');
  if (hashIndex !== -1) {
    cleaned = cleaned.substring(0, hashIndex);
  }

  // Strip trailing slashes or spaces
  cleaned = cleaned.trim();

  // Strip www. prefix
  if (cleaned.startsWith('www.')) {
    cleaned = cleaned.substring(4);
  }

  // Basic sanity check for valid domain string (must contain a dot and no spaces)
  if (!cleaned.includes('.') || cleaned.includes(' ')) {
    return '';
  }

  return cleaned;
}
