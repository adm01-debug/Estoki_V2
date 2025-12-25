import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TabsCustom } from './tabs-custom';

describe('TabsCustom', () => {
  const tabs = [
    { id: '1', label: 'Tab 1', content: <div>Content 1</div> },
    { id: '2', label: 'Tab 2', content: <div>Content 2</div> },
  ];

  it('should render tab labels', () => {
    render(<TabsCustom tabs={tabs} />);
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
  });

  it('should show first tab content by default', () => {
    render(<TabsCustom tabs={tabs} />);
    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  it('should switch tab content on click', () => {
    render(<TabsCustom tabs={tabs} />);
    fireEvent.click(screen.getByText('Tab 2'));
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('should call onChange when tab changes', () => {
    const onChange = vi.fn();
    render(<TabsCustom tabs={tabs} onChange={onChange} />);
    fireEvent.click(screen.getByText('Tab 2'));
    expect(onChange).toHaveBeenCalledWith('2');
  });
});
