import type { Meta, StoryObj } from '@storybook/react';
import Droppable from './Droppable';

const meta: Meta<typeof Droppable> = {
  title: 'DnD/Droppable',
  component: Droppable,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithItems: Story = { args: { items: [{ id: '1', content: 'Item 1' }] } };
