import { describe, it, expect } from 'vitest';
import { sanitizeSQL, sanitizeFilename, stripTags, escapeRegex, sanitizePath, sanitizeURL, sanitizeJSON } from './sanitize';

describe('sanitize', () => {
  it('should sanitize SQL', () => {
    expect(sanitizeSQL("test'; DROP TABLE--")).not.toContain("'");
    expect(sanitizeSQL("test'; DROP TABLE--")).not.toContain("--");
  });

  it('should remove SQL keywords', () => {
    expect(sanitizeSQL('DROP TABLE users')).not.toContain('DROP');
    expect(sanitizeSQL('UNION SELECT * FROM')).not.toContain('UNION');
  });

  it('should sanitize filename', () => {
    const result = sanitizeFilename('test<file>.txt');
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
  });

  it('should prevent path traversal in filename', () => {
    expect(sanitizeFilename('../../etc/passwd')).not.toContain('..');
  });

  it('should strip HTML tags', () => {
    expect(stripTags('<p>Hello</p>')).toBe('Hello');
  });

  it('should escape regex', () => {
    expect(escapeRegex('test.txt')).toBe('test\\.txt');
  });

  it('should sanitize paths', () => {
    expect(sanitizePath('../../secret/file')).not.toContain('..');
    expect(sanitizePath('//double//slash')).not.toContain('//');
  });

  it('should sanitize URLs', () => {
    expect(sanitizeURL('javascript:alert(1)')).toBe('');
    expect(sanitizeURL('data:text/html,<script>')).toBe('');
    expect(sanitizeURL('https://safe.com')).toBe('https://safe.com');
  });

  it('should sanitize JSON against prototype pollution', () => {
    const malicious = '{"__proto__": {"isAdmin": true}, "name": "test"}';
    const result = JSON.parse(sanitizeJSON(malicious));
    expect(result.__proto__).toBeUndefined();
    expect(result.name).toBe('test');
  });

  it('should handle null/empty inputs', () => {
    expect(sanitizeSQL('')).toBe('');
    expect(sanitizeFilename('')).toBe('');
    expect(stripTags('')).toBe('');
    expect(escapeRegex('')).toBe('');
    expect(sanitizePath('')).toBe('');
    expect(sanitizeURL('')).toBe('');
    expect(sanitizeJSON('')).toBe('{}');
  });
});
