import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import withAnalytics from './withAnalytics';

vi.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: vi.fn(() => ({ track: vi.fn(), page: vi.fn() }))
}));

const { useAnalytics } = await import('@/hooks/useAnalytics');

const TestComponent = ({ onClick }: { onClick?: () => void }) => (
  <button onClick={onClick}>Click Me</button>
);

describe('withAnalytics HOC', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should render wrapped component', () => {
    const WrappedComponent = withAnalytics(TestComponent, 'TestPage');
    render(<WrappedComponent />);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('should track page view on mount', () => {
    const mockPage = vi.fn();
    (useAnalytics as any).mockReturnValue({ track: vi.fn(), page: mockPage });
    const WrappedComponent = withAnalytics(TestComponent, 'TestPage');
    render(<WrappedComponent />);
    expect(mockPage).toHaveBeenCalledWith('TestPage');
  });

  it('should track events on interaction', () => {
    const mockTrack = vi.fn();
    (useAnalytics as any).mockReturnValue({ track: mockTrack, page: vi.fn() });
    const WrappedComponent = withAnalytics(TestComponent, 'TestPage', { trackClicks: true });
    render(<WrappedComponent onClick={() => {}} />);
    fireEvent.click(screen.getByText('Click Me'));
    expect(mockTrack).toHaveBeenCalled();
  });

  it('should pass props to wrapped component', () => {
    const PropsComponent = ({ label }: { label: string }) => <span>{label}</span>;
    const WrappedComponent = withAnalytics(PropsComponent, 'PropsPage');
    render(<WrappedComponent label="Test Label" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('should set correct display name', () => {
    const NamedComponent = () => <div>Named</div>;
    NamedComponent.displayName = 'AnalyticsComp';
    const WrappedComponent = withAnalytics(NamedComponent, 'Page');
    expect(WrappedComponent.displayName).toBe('withAnalytics(AnalyticsComp)');
  });
});
