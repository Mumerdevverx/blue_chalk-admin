const escapeHtml = (value) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

export const createWorkAboutContent = (content, left, right) => (
  `<div data-work-about-content="true">` +
  `<div data-work-main-content="true">${content}</div>` +
  `<div data-work-left-text="true">${escapeHtml(left)}</div>` +
  `<div data-work-right-text="true">${escapeHtml(right)}</div>` +
  '</div>'
);

export const getWorkAboutContent = (value) => {
  const result = { content: value || '', left: '', right: '', legacyColumns: false };
  if (!value || typeof DOMParser === 'undefined') return result;

  const parsed = new DOMParser().parseFromString(value, 'text/html');
  const wrappedContent = parsed.querySelector('[data-work-about-content="true"]');

  if (wrappedContent) {
    return {
      content: wrappedContent.querySelector('[data-work-main-content="true"]')?.innerHTML || '',
      left: wrappedContent.querySelector('[data-work-left-text="true"]')?.textContent || '',
      right: wrappedContent.querySelector('[data-work-right-text="true"]')?.textContent || '',
      legacyColumns: false
    };
  }

  const oldColumns = parsed.querySelector('[data-work-about-columns="true"]');
  if (oldColumns) {
    return {
      content: '',
      left: oldColumns.querySelector('[data-work-about-column="left"]')?.textContent || '',
      right: oldColumns.querySelector('[data-work-about-column="right"]')?.textContent || '',
      legacyColumns: true
    };
  }

  const legacyColumns = { left: '', right: '' };
  let activeColumn = null;
  let foundColumn = false;

  parsed.body.childNodes.forEach((node) => {
    const headingText = node.textContent?.trim().replace(/^#+\s*/, '').toLowerCase();
    if (headingText === 'about us (left)' || headingText === 'about us (right)') {
      activeColumn = headingText.endsWith('(left)') ? 'left' : 'right';
      foundColumn = true;
      return;
    }

    if (activeColumn) {
      legacyColumns[activeColumn] += node.outerHTML || node.textContent || '';
    }
  });

  if (!foundColumn) return result;

  const getText = (html) => new DOMParser()
    .parseFromString(html, 'text/html')
    .body.textContent || '';

  return {
    content: '',
    left: getText(legacyColumns.left),
    right: getText(legacyColumns.right),
    legacyColumns: true
  };
};
