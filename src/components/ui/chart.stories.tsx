import type { Meta, StoryObj } from '@storybook/react';
import { Chart } from './chart';

const meta: Meta<typeof Chart> = {
  title: 'UI/Chart',
  component: Chart,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const Playground: Story = { args: {} };
