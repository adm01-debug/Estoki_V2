import type { Meta, StoryObj } from '@storybook/react';
import { VirtualList } from './virtual-list';

const meta: Meta<typeof VirtualList> = {
  title: 'UI/VirtualList',
  component: VirtualList,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const Playground: Story = { args: {} };
