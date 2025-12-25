import type { Meta, StoryObj } from '@storybook/react';
import CodeBlock from './CodeBlock';

const meta: Meta<typeof CodeBlock> = {
  title: 'Display/CodeBlock',
  component: CodeBlock,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithData: Story = { args: { data: 'Sample' } };
export const Large: Story = { args: { size: 'lg' } };
