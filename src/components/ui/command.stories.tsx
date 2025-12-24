import type { Meta, StoryObj } from '@storybook/react';
import { Command } from './command';

const meta: Meta<typeof Command> = {
  title: 'UI/Command',
  component: Command,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const Playground: Story = { args: {} };
