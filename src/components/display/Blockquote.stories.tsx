import type { Meta, StoryObj } from '@storybook/react';
import Blockquote from './Blockquote';

const meta: Meta<typeof Blockquote> = {
  title: 'Display/Blockquote',
  component: Blockquote,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithData: Story = { args: { data: 'Sample' } };
export const Large: Story = { args: { size: 'lg' } };
