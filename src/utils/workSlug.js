export const getWorkNameSlug = (work) => {
  const name = work?.buttonText || work?.title || work?.name || work?.slug || '';

  return String(name)
    .replace(/&nbsp;|nbsp/gi, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};
