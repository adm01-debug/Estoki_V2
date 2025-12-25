import type { Meta, StoryObj } from '@storybook/react';
import Space from './Space';

const meta: Meta<typeof Space> = {
  title: 'Layout/Space',
  component: Space,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithChildren: Story = { args: { children: 'Content' } };
export const CustomClass: Story = { args: { className: 'custom' } };
