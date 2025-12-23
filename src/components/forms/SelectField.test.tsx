import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SelectField from './SelectField';

describe('SelectField', () => {
  it('should render select field', () => {
    render(<SelectField label="Status" name="status" options={[]} />);
    expect(screen.getByText('Status')).toBeInTheDocument();
  });
});
