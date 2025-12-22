import { describe, it, expect, vi } from 'vitest';
import { api } from './api';

describe('api', () => {
  it('should have api object', () => {
    expect(api).toBeDefined();
  });
});
