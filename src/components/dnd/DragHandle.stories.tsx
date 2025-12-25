import type { Meta, StoryObj } from '@storybook/react';
import DragHandle from './DragHandle';

const meta: Meta<typeof DragHandle> = {
  title: 'DnD/DragHandle',
  component: DragHandle,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithItems: Story = { args: { items: [{ id: '1', content: 'Item 1' }] } };
