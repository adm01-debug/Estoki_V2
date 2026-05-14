/**
 * Sanitização de inputs - Módulo de segurança
 * Protege contra XSS, SQL Injection, Path Traversal
 */
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML using DOMPurify (safe for dangerouslySetInnerHTML)
 */
export const sanitizeHTML = (html: string): string => {
  if (!html) return '';
  
  // For tests/security, first escape critical characters if we want strict sanitization
  // but keep allowed tags for legitimate usage.
  // If the input is just malicious tags, we want it to be escaped or removed.
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id'],
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Escape text for safe display (no HTML allowed)
 */
export const escapeHTML = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * @deprecated sanitizeSQL is an anti-pattern. Use parameterized queries (Supabase SDK) instead.
 * Kept only as a no-op for backward compatibility during migration.
 */
export const sanitizeSQL = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/'/g, "''")
    .replace(/"/g, '""')
    .replace(/;/g, '')
    .replace(/--/g, '')
    .trim();
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
