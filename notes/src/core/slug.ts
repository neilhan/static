const MAX_SLUG_LENGTH = 60;

export const slugifyTitle = (title: string): string => {
  const normalized = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const capped = normalized.slice(0, MAX_SLUG_LENGTH).replace(/-+$/g, '');
  return capped || 'item';
};

export const generateUniqueSlug = (
  title: string,
  existingSlugs: Iterable<string>
): string => {
  const base = slugifyTitle(title);
  const taken = new Set(existingSlugs);
  if (!taken.has(base)) {
    return base;
  }

  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
};
