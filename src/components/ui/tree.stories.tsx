import type { Meta, StoryObj } from '@storybook/react';
import { Tree } from './tree';

const meta: Meta<typeof Tree> = {
  title: 'UI/Tree',
  component: Tree,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const Playground: Story = { args: {} };
