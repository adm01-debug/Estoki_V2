import type { Meta, StoryObj } from '@storybook/react';
import KanbanBoard from './KanbanBoard';

const meta: Meta<typeof KanbanBoard> = {
  title: 'DnD/KanbanBoard',
  component: KanbanBoard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithItems: Story = { args: { items: [{ id: '1', content: 'Item 1' }] } };
