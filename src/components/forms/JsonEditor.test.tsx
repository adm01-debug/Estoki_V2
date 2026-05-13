import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { JsonEditor } from './JsonEditor';

describe('JsonEditor', () => {
  it('renders valid JSON state by default', () => {
    render(<JsonEditor value={{ foo: 'bar' }} />);
    expect(screen.getByText('JSON válido')).toBeInTheDocument();
  });

  it('shows error for invalid JSON', () => {
    render(<JsonEditor value={{ foo: 'bar' }} />);
    const textarea = screen.getByRole('textbox');
    
    fireEvent.change(textarea, { target: { value: '{ invalid: json }' } });
    
    expect(screen.queryByText('JSON válido')).not.toBeInTheDocument();
    expect(screen.getByText(/Expected property name|Unexpected token/)).toBeInTheDocument();
  });

  it('calls onChange when valid JSON is entered', () => {
    const onChange = vi.fn();
    render(<JsonEditor value={{}} onChange={onChange} />);
    const textarea = screen.getByRole('textbox');
    
    fireEvent.change(textarea, { target: { value: '{"new": "value"}' } });
    
    expect(onChange).toHaveBeenCalledWith({ new: "value" });
    expect(screen.getByText('JSON válido')).toBeInTheDocument();
  });
});
