import type { Meta, StoryObj } from '@storybook/react';
import SkipLinks from './SkipLinks';

const meta: Meta<typeof SkipLinks> = {
  title: 'A11y/SkipLinks',
  component: SkipLinks,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Accessible content' } };
