import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TooltipIcon } from './tooltip-icon';

describe('TooltipIcon', () => {
  it('renders help icon', () => {
    const { container } = render(<TooltipIcon content="Helpful info" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  // Nota: Testar o conteúdo do tooltip geralmente exige fireEvent.mouseOver 
  // e aguardar o render em componentes baseados em Radix, 
  // mas aqui focamos na presença do trigger.
});
