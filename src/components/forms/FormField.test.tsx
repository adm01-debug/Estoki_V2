import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FormField from './FormField';

describe('FormField', () => {
  it('should render form field with label', () => {
    render(<FormField label="Email" name="email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });
});
