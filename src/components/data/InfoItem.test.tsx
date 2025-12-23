import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import InfoItem from './InfoItem';

describe('InfoItem', () => {
  it('should render label and value', () => {
    render(<InfoItem label="Nome" value="Teste" />);
    expect(screen.getByText('Nome')).toBeInTheDocument();
    expect(screen.getByText('Teste')).toBeInTheDocument();
  });
});
