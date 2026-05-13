import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

const ThrowError = ({ shouldThrow = true }) => { 
  if (shouldThrow) throw new Error('Test error'); 
  return <div>Recovered Content</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => { 
    vi.spyOn(console, 'error').mockImplementation(() => {}); 
  });
  
  afterEach(() => { vi.restoreAllMocks(); });

  it('deve renderizar os filhos quando não houver erro', () => {
    render(<ErrorBoundary><div>Content</div></ErrorBoundary>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('deve renderizar a UI padrão de erro quando ocorrer uma exceção', () => {
    render(<ErrorBoundary><ThrowError /></ErrorBoundary>);
    expect(screen.getByText(/algo deu errado/i)).toBeInTheDocument();
    expect(screen.getByText(/ocorreu um erro inesperado/i)).toBeInTheDocument();
  });

  it('deve renderizar um fallback personalizado se fornecido', () => {
    const CustomFallback = <div>Custom Error UI</div>;
    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
  });

  it('deve chamar a prop onError quando um erro for capturado', () => {
    const onErrorMock = vi.fn();
    render(
      <ErrorBoundary onError={onErrorMock}>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(onErrorMock).toHaveBeenCalled();
    expect(onErrorMock.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onErrorMock.mock.calls[0][0].message).toBe('Test error');
  });

  it('deve permitir tentar novamente e renderizar os filhos após o reset do estado', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/algo deu errado/i)).toBeInTheDocument();

    // Simulamos que o componente não vai mais lançar erro no próximo render
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText(/tentar novamente/i));

    expect(screen.queryByText(/algo deu errado/i)).not.toBeInTheDocument();
    expect(screen.getByText('Recovered Content')).toBeInTheDocument();
  });
});
