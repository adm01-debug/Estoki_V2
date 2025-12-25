import type { Meta, StoryObj } from '@storybook/react';
import KanbanCard from './KanbanCard';

const meta: Meta<typeof KanbanCard> = {
  title: 'Kanban/KanbanCard',
  component: KanbanCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { id: '1', title: 'Card Title' } };
export const WithTags: Story = { args: { id: '1', title: 'Tagged', tags: ['urgent'] } };
