import type { Meta, StoryObj } from '@storybook/react';
import Masonry from './Masonry';

const meta: Meta<typeof Masonry> = {
  title: 'Layout/Masonry',
  component: Masonry,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithChildren: Story = { args: { children: 'Content' } };
export const CustomClass: Story = { args: { className: 'custom' } };
