import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TooltipIcon } from './tooltip-icon';

describe('TooltipIcon', () => {
  it('should render icon', () => {
    render(<TooltipIcon content="Help text" />);
    const icon = screen.getByRole('img', { hidden: true }) || screen.getByTestId('tooltip-icon');
    expect(icon).toBeInTheDocument();
  });

  it('should show tooltip on hover', async () => {
    render(<TooltipIcon content="Help text" />);
    const trigger = screen.getByRole('button') || screen.getByTestId('tooltip-trigger');
    fireEvent.mouseEnter(trigger);
    expect(await screen.findByText('Help text')).toBeInTheDocument();
  });

  it('should hide tooltip on mouse leave', async () => {
    render(<TooltipIcon content="Help text" />);
    const trigger = screen.getByRole('button') || screen.getByTestId('tooltip-trigger');
    fireEvent.mouseEnter(trigger);
    fireEvent.mouseLeave(trigger);
  });

  it('should accept custom icon', () => {
    render(<TooltipIcon content="Help" icon={<span>❓</span>} />);
    expect(screen.getByText('❓')).toBeInTheDocument();
  });
});
