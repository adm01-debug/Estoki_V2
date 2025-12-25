import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WeekPicker from './WeekPicker';

describe('WeekPicker', () => {
  it('should render without crashing', () => {
    render(<WeekPicker />);
  });

  it('should accept value prop', () => {
    render(<WeekPicker value="test" />);
  });

  it('should call onChange when value changes', () => {
    const onChange = vi.fn();
    render(<WeekPicker onChange={onChange} />);
  });

  it('should be disabled when disabled prop is true', () => {
    const { container } = render(<WeekPicker disabled />);
    expect(container.querySelector('[disabled]')).toBeInTheDocument();
  });

  it('should accept className prop', () => {
    const { container } = render(<WeekPicker className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('should show error state', () => {
    render(<WeekPicker error="Error message" />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
});
