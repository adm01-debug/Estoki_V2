import type { Meta, StoryObj } from '@storybook/react';
import KanbanColumn from './KanbanColumn';

const meta: Meta<typeof KanbanColumn> = {
  title: 'Kanban/KanbanColumn',
  component: KanbanColumn,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { id: '1', title: 'Card Title' } };
export const WithTags: Story = { args: { id: '1', title: 'Tagged', tags: ['urgent'] } };
