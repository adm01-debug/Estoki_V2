import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WeekPicker } from './WeekPicker';

describe('WeekPicker', () => {
  it('renders correctly', () => {
    render(<WeekPicker />);
    expect(screen.getByText('Selecionar semana')).toBeInTheDocument();
  });

  it('calls onChange when a week is selected', () => {
    const onChange = vi.fn();
    render(<WeekPicker onChange={onChange} />);
    fireEvent.click(screen.getByText('Selecionar semana'));
    // Find any week button (Semana X)
    const weekButtons = screen.getAllByText(/Semana/);
    fireEvent.click(weekButtons[0]);
    expect(onChange).toHaveBeenCalled();
  });
});
