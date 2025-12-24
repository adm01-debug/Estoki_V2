import type { Meta, StoryObj } from '@storybook/react';
import { AspectRatio } from './aspect-ratio';

const meta: Meta<typeof AspectRatio> = {
  title: 'UI/AspectRatio',
  component: AspectRatio,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const Playground: Story = { args: {} };
