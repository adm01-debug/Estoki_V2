import { render, screen } from '@testing-library/react';
import { SkipLinks } from './SkipLinks';
import { describe, it, expect } from 'vitest';

describe('SkipLinks', () => {
  it('renders default skip links', () => {
    render(<SkipLinks />);
    const mainContentLink = screen.getByText('Pular para conteúdo principal');
    const navLink = screen.getByText('Pular para navegação');

    expect(mainContentLink).toBeInTheDocument();
    expect(mainContentLink).toHaveAttribute('href', '#main-content');
    expect(navLink).toBeInTheDocument();
    expect(navLink).toHaveAttribute('href', '#main-navigation');
  });

  it('renders custom skip links when provided', () => {
    const customLinks = [{ id: 'custom', label: 'Skip to custom' }];
    render(<SkipLinks links={customLinks} />);
    const link = screen.getByText('Skip to custom');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#custom');
  });

  it('has sr-only class by default', () => {
    render(<SkipLinks />);
    const link = screen.getByText('Pular para conteúdo principal');
    expect(link).toHaveClass('sr-only');
  });
});
