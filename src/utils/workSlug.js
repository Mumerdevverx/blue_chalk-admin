export const getWorkNameSlug = (work) => {
<<<<<<< HEAD
  const name = work?.buttonText || work?.title || work?.name || work?.slug || '';
=======
  const name = work?.title || work?.buttonText || work?.name || work?.slug || '';
>>>>>>> 6418787e0e8b8fcf5e77156e8f5ce8ce21040e3d

  return String(name)
    .replace(/&nbsp;|nbsp/gi, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};
