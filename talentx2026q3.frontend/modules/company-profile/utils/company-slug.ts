/**
 * Generates a clean URL slug from a company name.
 * e.g., "Acme AI Corp, Inc." -> "acme-ai-corp-inc"
 */
export function slugifyCompanyName(name: string): string {
  if (!name || typeof name !== 'string') {
    return 'company';
  }

  const slug = name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric chars
    .replace(/[\s_]+/g, '-') // collapse whitespace and underscores to hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens

  return slug || 'company';
}

/**
 * Normalizes a URL input, adding 'https://' if protocol is missing.
 */
export function normalizeUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') {
    return '';
  }
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Returns the public profile path for a company slug.
 */
export function getCompanyProfilePath(slug: string): string {
  return `/companies/${encodeURIComponent(slug)}`;
}

/**
 * Returns the absolute or relative public company profile URL.
 */
export function getCompanyProfileFullUrl(slug: string, origin = ''): string {
  const path = getCompanyProfilePath(slug);
  return origin ? `${origin.replace(/\/$/, '')}${path}` : path;
}
