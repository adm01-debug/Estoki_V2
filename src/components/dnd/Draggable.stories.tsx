import type { Meta, StoryObj } from '@storybook/react';
import Draggable from './Draggable';

const meta: Meta<typeof Draggable> = {
  title: 'DnD/Draggable',
  component: Draggable,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithItems: Story = { args: { items: [{ id: '1', content: 'Item 1' }] } };
