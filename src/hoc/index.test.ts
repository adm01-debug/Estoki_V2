import { describe, it, expect } from 'vitest';
import * as hocs from './index';

describe('HOCs Index', () => {
  it('exports withAuth', () => {
    expect(hocs.withAuth).toBeDefined();
  });

  it('exports withLoading', () => {
    expect(hocs.withLoading).toBeDefined();
    expect(hocs.withSkeleton).toBeDefined();
  });

  it('exports withErrorHandler', () => {
    expect(hocs.withErrorHandler).toBeDefined();
  });

  it('exports withAnalytics', () => {
    expect(hocs.withAnalytics).toBeDefined();
  });
});
