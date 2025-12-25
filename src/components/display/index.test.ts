import { describe, it, expect } from 'vitest';
import * as DisplayComponents from './index';

describe('Display Components Index', () => {
  it('should export AvatarGroup', () => {
    expect(DisplayComponents.AvatarGroup).toBeDefined();
  });

  it('should export Blockquote', () => {
    expect(DisplayComponents.Blockquote).toBeDefined();
  });

  it('should export Clock', () => {
    expect(DisplayComponents.Clock).toBeDefined();
  });

  it('should export CodeBlock', () => {
    expect(DisplayComponents.CodeBlock).toBeDefined();
  });

  it('should export all display components', () => {
    const exports = Object.keys(DisplayComponents);
    expect(exports.length).toBeGreaterThan(5);
  });
});
