import type { Meta, StoryObj } from '@storybook/react';
import SplitPane from './SplitPane';

const meta: Meta<typeof SplitPane> = {
  title: 'Layout/SplitPane',
  component: SplitPane,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithChildren: Story = { args: { children: 'Content' } };
export const CustomClass: Story = { args: { className: 'custom' } };
