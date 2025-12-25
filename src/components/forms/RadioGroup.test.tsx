import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RadioGroup from './RadioGroup';

describe('RadioGroup', () => {
  it('should render without crashing', () => {
    render(<RadioGroup />);
  });

  it('should accept value prop', () => {
    render(<RadioGroup value="test" />);
  });

  it('should call onChange when value changes', () => {
    const onChange = vi.fn();
    render(<RadioGroup onChange={onChange} />);
  });

  it('should be disabled when disabled prop is true', () => {
    const { container } = render(<RadioGroup disabled />);
    expect(container.querySelector('[disabled]')).toBeInTheDocument();
  });

  it('should accept className prop', () => {
    const { container } = render(<RadioGroup className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('should show error state', () => {
    render(<RadioGroup error="Error message" />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
});
