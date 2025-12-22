import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotificationProvider } from './NotificationContext';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({ select: vi.fn().mockResolvedValue({ data: [], error: null }) })),
    channel: vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn() })),
  },
}));

describe('NotificationContext', () => {
  it('should render children', () => {
    render(<NotificationProvider><div data-testid="child">Test</div></NotificationProvider>);
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
