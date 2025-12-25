import type { Meta, StoryObj } from '@storybook/react';
import VisuallyHidden from './VisuallyHidden';

const meta: Meta<typeof VisuallyHidden> = {
  title: 'A11y/VisuallyHidden',
  component: VisuallyHidden,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Accessible content' } };
