import type { Meta, StoryObj } from '@storybook/react';
import ResizablePanel from './ResizablePanel';

const meta: Meta<typeof ResizablePanel> = {
  title: 'Layout/ResizablePanel',
  component: ResizablePanel,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithChildren: Story = { args: { children: 'Content' } };
export const CustomClass: Story = { args: { className: 'custom' } };
