import type { Meta, StoryObj } from '@storybook/react';
import Message from './Message';

const meta: Meta<typeof Message> = {
  title: 'Feedback/Message',
  component: Message,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const Success: Story = { args: { variant: 'success' } };
export const Error: Story = { args: { variant: 'error' } };
export const Warning: Story = { args: { variant: 'warning' } };
