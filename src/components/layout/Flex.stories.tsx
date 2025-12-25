import type { Meta, StoryObj } from '@storybook/react';
import Flex from './Flex';

const meta: Meta<typeof Flex> = {
  title: 'Layout/Flex',
  component: Flex,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithChildren: Story = { args: { children: 'Content' } };
export const CustomClass: Story = { args: { className: 'custom' } };
