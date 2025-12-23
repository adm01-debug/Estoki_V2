import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import VolumeContagem from './VolumeContagem';

describe('VolumeContagem', () => {
  it('should render without errors', () => {
    const { container } = render(<VolumeContagem />);
    expect(container).toBeInTheDocument();
  });
});
