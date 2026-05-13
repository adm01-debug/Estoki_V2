import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingFallback } from './LoadingFallback';
import React from 'react';

describe('LoadingFallback', () => {
  it('deve renderizar o indicador de carregamento e o texto padrão', () => {
    render(<LoadingFallback />);
    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
    // O ícone do lucide-react (Loader2) geralmente tem a classe animate-spin
    const loader = screen.getByText(/carregando/i).previousSibling;
    expect(loader).toHaveClass('animate-spin');
  });

  it('deve encaminhar a ref corretamente', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<LoadingFallback ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('min-h-screen');
  });
});
