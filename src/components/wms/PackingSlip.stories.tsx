import type { Meta, StoryObj } from '@storybook/react';
import PackingSlip from './PackingSlip';

const meta: Meta<typeof PackingSlip> = {
  title: 'WMS/PackingSlip',
  component: PackingSlip,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };

export const WithData: Story = {
  args: {
    data: { id: '1', name: 'Sample', value: 100 },
  },
};

export const Loading: Story = { args: { isLoading: true } };

export const Error: Story = { args: { error: 'Error loading data' } };
