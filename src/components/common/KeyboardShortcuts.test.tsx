import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { KeyboardShortcutsHelp, useKeyboardShortcuts } from './KeyboardShortcuts';
import React from 'react';

describe('KeyboardShortcuts', () => {
  it('deve renderizar a ajuda de atalhos quando aberta', () => {
    const { container } = render(<BrowserRouter><KeyboardShortcutsHelp open={true} onOpenChange={vi.fn()} /></BrowserRouter>);
    expect(screen.getByText('Atalhos de Teclado')).toBeInTheDocument();
    expect(screen.getByText('Busca rápida')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+K')).toBeInTheDocument();
  });

  it('deve disparar a ação do atalho quando a tecla correspondente for pressionada', () => {
    const actionMock = vi.fn();
    const shortcuts = [{ key: 'ctrl+s', description: 'Salvar', action: actionMock }];
    
    function TestComponent() {
      useKeyboardShortcuts(shortcuts);
      return <div>Test</div>;
    }

    render(<TestComponent />);

    fireEvent.keyDown(window, { key: 's', ctrlKey: true });

    expect(actionMock).toHaveBeenCalled();
  });

  it('não deve disparar a ação se o foco estiver em um input', () => {
    const actionMock = vi.fn();
    const shortcuts = [{ key: 's', description: 'Salvar', action: actionMock }];
    
    function TestComponent() {
      useKeyboardShortcuts(shortcuts);
      return <input data-testid="test-input" />;
    }

    render(<TestComponent />);
    const input = screen.getByTestId('test-input');
    input.focus();

    fireEvent.keyDown(input, { key: 's' });

    expect(actionMock).not.toHaveBeenCalled();
  });
});
