import type { Meta, StoryObj } from '@storybook/react';
import InventoryCard from './InventoryCard';

const meta: Meta<typeof InventoryCard> = {
  title: 'WMS/InventoryCard',
  component: InventoryCard,
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
