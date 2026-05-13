import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MonthPicker } from './MonthPicker';

describe('MonthPicker', () => {
  it('renders "Selecionar mês" by default', () => {
    render(<MonthPicker />);
    expect(screen.getByText('Selecionar mês')).toBeInTheDocument();
  });

  it('renders selected date correctly', () => {
    const date = new Date(2024, 4, 1); // Maio 2024
    render(<MonthPicker value={date} />);
    expect(screen.getByText('Mai 2024')).toBeInTheDocument();
  });

  it('calls onChange when a month is selected', () => {
    const onChange = vi.fn();
    render(<MonthPicker onChange={onChange} />);
    
    fireEvent.click(screen.getByText('Selecionar mês'));
    fireEvent.click(screen.getByText('Jan'));
    
    expect(onChange).toHaveBeenCalled();
  });
});
