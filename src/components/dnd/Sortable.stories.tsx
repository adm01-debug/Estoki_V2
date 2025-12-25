import type { Meta, StoryObj } from '@storybook/react';
import Sortable from './Sortable';

const meta: Meta<typeof Sortable> = {
  title: 'DnD/Sortable',
  component: Sortable,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithItems: Story = { args: { items: [{ id: '1', content: 'Item 1' }] } };
