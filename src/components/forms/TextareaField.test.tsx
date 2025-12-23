import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TextareaField from './TextareaField';

describe('TextareaField', () => {
  it('should render textarea field', () => {
    render(<TextareaField label="Descrição" name="descricao" />);
    expect(screen.getByText('Descrição')).toBeInTheDocument();
  });
});
