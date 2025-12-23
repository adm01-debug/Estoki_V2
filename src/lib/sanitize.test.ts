import { describe, it, expect } from 'vitest';
import { sanitizeSQL, sanitizeFilename, stripTags, escapeRegex } from './sanitize';

describe('sanitize', () => {
  it('should sanitize SQL', () => {
    expect(sanitizeSQL("test'; DROP TABLE--")).not.toContain("'");
    expect(sanitizeSQL("test'; DROP TABLE--")).not.toContain("--");
  });

  it('should sanitize filename', () => {
    expect(sanitizeFilename('test<file>.txt')).toBe('test_file_.txt');
  });

  it('should strip HTML tags', () => {
    expect(stripTags('<p>Hello</p>')).toBe('Hello');
  });

  it('should escape regex', () => {
    expect(escapeRegex('test.txt')).toBe('test\\.txt');
  });
});
