import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert } from './Alert';

describe('Alert', () => {
  it('should render alert message', () => {
    render(<Alert>Test Alert</Alert>);
    expect(screen.getByText('Test Alert')).toBeInTheDocument();
  });
});
