import type { Meta, StoryObj } from '@storybook/react';
import Highlight from './Highlight';

const meta: Meta<typeof Highlight> = {
  title: 'Display/Highlight',
  component: Highlight,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithData: Story = { args: { data: 'Sample' } };
export const Large: Story = { args: { size: 'lg' } };
