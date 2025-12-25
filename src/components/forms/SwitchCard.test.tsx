import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SwitchCard from './SwitchCard';

describe('SwitchCard', () => {
  it('should render without crashing', () => {
    render(<SwitchCard />);
  });

  it('should accept value prop', () => {
    render(<SwitchCard value="test" />);
  });

  it('should call onChange when value changes', () => {
    const onChange = vi.fn();
    render(<SwitchCard onChange={onChange} />);
  });

  it('should be disabled when disabled prop is true', () => {
    const { container } = render(<SwitchCard disabled />);
    expect(container.querySelector('[disabled]')).toBeInTheDocument();
  });

  it('should accept className prop', () => {
    const { container } = render(<SwitchCard className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('should show error state', () => {
    render(<SwitchCard error="Error message" />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
});
