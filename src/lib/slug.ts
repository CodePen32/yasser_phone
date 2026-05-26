/**
 * Central slug utility — used by admin forms, API routes, and scripts.
 * Rules: lowercase, latin + digits + hyphens only, no leading/trailing hyphens.
 */

export function toSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')  // strip everything non-latin
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+([a-z0-9-]*[a-z0-9])?$/.test(slug);
}

export function assertSlug(slug: string, label = 'slug'): void {
  if (!slug || !isValidSlug(slug)) {
    throw new Error(`${label} غير صالح: "${slug}". يجب أن يحتوي على حروف لاتينية وأرقام وشرطات فقط.`);
  }
}
