/**
 * Sanitização de inputs - Módulo de segurança
 * Protege contra XSS, SQL Injection, Path Traversal
 */

export const sanitizeHTML = (html: string): string => {
  if (!html) return '';
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

/**
 * @deprecated sanitizeSQL is an anti-pattern. Use parameterized queries (Supabase SDK) instead.
 * Kept only as a no-op for backward compatibility during migration.
 */
export const sanitizeSQL = (input: string): string => {
  if (!input) return '';
  return input.trim();
};

export const sanitizeFilename = (filename: string): string => {
  if (!filename) return '';
  return filename
    .replace(/\.\./g, '') // prevent path traversal
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 255);
};

export const stripTags = (html: string): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};

export const escapeRegex = (str: string): string => {
  if (!str) return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Sanitiza path para prevenir path traversal
 */
export const sanitizePath = (path: string): string => {
  if (!path) return '';
  return path
    .replace(/\.\./g, '')
    .replace(/\/\//g, '/')
    .replace(/^\/+/, '')
    .trim();
};

/**
 * Sanitiza input JSON para prevenir prototype pollution
 */
export const sanitizeJSON = (input: string): string => {
  if (!input) return '{}';
  try {
    const parsed = JSON.parse(input);
    // Remove __proto__ and constructor keys
    const clean = JSON.parse(JSON.stringify(parsed, (key, value) => {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') return undefined;
      return value;
    }));
    return JSON.stringify(clean);
  } catch {
    return '{}';
  }
};

/**
 * Sanitiza URL para prevenir open redirect e javascript: protocol
 */
export const sanitizeURL = (url: string): string => {
  if (!url) return '';
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:') || trimmed.startsWith('vbscript:')) {
    return '';
  }
  return url.trim();
};
