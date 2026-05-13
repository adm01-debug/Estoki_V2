import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationCenter } from './NotificationCenter';
import { useNotifications } from '@/contexts/NotificationContext';

// Mock context
vi.mock('@/contexts/NotificationContext', () => ({
  useNotifications: vi.fn(),
}));

describe('NotificationCenter', () => {
  const mockNotifications = [
    {
      id: '1',
      type: 'alerta',
      title: 'Alerta Teste',
      message: 'Mensagem de teste',
      read: false,
      createdAt: new Date(),
      severity: 'warning'
    },
    {
      id: '2',
      type: 'recebimento_conferido',
      title: 'Conferido',
      message: 'Lote conferido com sucesso',
      read: true,
      createdAt: new Date(),
      severity: 'info'
    }
  ];

  const mockContextValue = {
    notifications: mockNotifications,
    unreadCount: 1,
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    clearAll: vi.fn(),
    removeNotification: vi.fn(),
    pushPermission: 'default',
    requestPushPermission: vi.fn(),
    soundEnabled: true,
    setSoundEnabled: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useNotifications as any).mockReturnValue(mockContextValue);
  });

  it('deve renderizar o sino com o contador de notificações não lidas', () => {
    render(<NotificationCenter />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /notificações/i })).toBeInTheDocument();
  });

  it('deve abrir o popover e exibir as notificações ao clicar no sino', () => {
    render(<NotificationCenter />);
    const trigger = screen.getByRole('button', { name: /notificações/i });
    fireEvent.click(trigger);

    expect(screen.getByText('Alerta Teste')).toBeInTheDocument();
    expect(screen.getByText('Conferido')).toBeInTheDocument();
  });

  it('deve chamar markAsRead ao clicar em uma notificação', () => {
    render(<NotificationCenter />);
    fireEvent.click(screen.getByRole('button', { name: /notificações/i }));
    
    const notificationItem = screen.getByText('Alerta Teste').closest('div');
    if (notificationItem) fireEvent.click(notificationItem);

    expect(mockContextValue.markAsRead).toHaveBeenCalledWith('1');
  });

  it('deve alternar o som ao clicar no botão de volume', () => {
    render(<NotificationCenter />);
    fireEvent.click(screen.getByRole('button', { name: /notificações/i }));
    
    const volumeButton = screen.getByTitle(/desativar som/i);
    fireEvent.click(volumeButton);

    expect(mockContextValue.setSoundEnabled).toHaveBeenCalledWith(false);
  });

  it('deve chamar markAllAsRead ao clicar no botão correspondente', () => {
    render(<NotificationCenter />);
    fireEvent.click(screen.getByRole('button', { name: /notificações/i }));
    
    const markAllButton = screen.getByText(/marcar lidas/i);
    fireEvent.click(markAllButton);

    expect(mockContextValue.markAllAsRead).toHaveBeenCalled();
  });

  it('deve exibir mensagem de vazio quando não houver notificações', () => {
    (useNotifications as any).mockReturnValue({
      ...mockContextValue,
      notifications: [],
      unreadCount: 0
    });

    render(<NotificationCenter />);
    fireEvent.click(screen.getByRole('button', { name: /notificações/i }));

    expect(screen.getByText(/nenhuma notificação/i)).toBeInTheDocument();
  });
});
