import { describe, it, expect, vi } from 'vitest';
import { trackEvent, trackPageView, initAnalytics } from './analytics';

describe('analytics', () => {
  it('should track events', () => {
    expect(() => trackEvent('test', {})).not.toThrow();
  });
  it('should track page views', () => {
    expect(() => trackPageView('/test')).not.toThrow();
  });
});
