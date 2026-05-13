import { render } from '@testing-library/react';
import { withAnalytics } from './withAnalytics';
import { useAnalytics } from '@/hooks/useAnalytics';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: vi.fn(),
}));

const TestComponent = () => <div>Analytics</div>;

describe('withAnalytics', () => {
  const trackPage = vi.fn();
  const trackEvent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAnalytics as any).mockReturnValue({ trackPage, trackEvent });
  });

  it('tracks page view on mount', () => {
    const Wrapped = withAnalytics(TestComponent, { componentName: 'Test' });
    render(
      <MemoryRouter initialEntries={['/test']}>
        <Routes>
          <Route path="/test" element={<Wrapped />} />
        </Routes>
      </MemoryRouter>
    );

    expect(trackPage).toHaveBeenCalledWith(expect.objectContaining({
      path: '/test',
      component: 'Test'
    }));
  });

  it('tracks mount and unmount events', () => {
    const Wrapped = withAnalytics(TestComponent, { componentName: 'Test' });
    const { unmount } = render(
      <MemoryRouter>
        <Wrapped />
      </MemoryRouter>
    );

    expect(trackEvent).toHaveBeenCalledWith({
      category: 'Component',
      action: 'Mount',
      label: 'Test'
    });

    unmount();

    expect(trackEvent).toHaveBeenCalledWith({
      category: 'Component',
      action: 'Unmount',
      label: 'Test'
    });
  });
});
