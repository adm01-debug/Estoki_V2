import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: '1' } }) }));
vi.mock('@/contexts/ThemeContext', () => ({ useTheme: () => ({ theme: 'light', setTheme: vi.fn() }) }));
vi.mock('@/contexts/NotificationContext', () => ({ useNotifications: () => ({ notifications: [], unreadCount: 0, markAsRead: vi.fn() }) }));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}><BrowserRouter>{children}</BrowserRouter></QueryClientProvider>
);

describe('Configuracoes Page', () => {
  it('should render settings page', async () => {
    const { default: Configuracoes } = await import('./Configuracoes');
    const { container } = render(<Configuracoes />, { wrapper });
    expect(container).toBeInTheDocument();
  });
});
