export const sanitizeHTML = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

export const sanitizeSQL = (input: string): string => {
  return input.replace(/['";]/g, '').replace(/--/g, '');
};

export const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 255);
};

export const stripTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

export const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
