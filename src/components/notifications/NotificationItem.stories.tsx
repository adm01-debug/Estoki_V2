import type { Meta, StoryObj } from '@storybook/react';
import NotificationItem from './NotificationItem';

const meta: Meta<typeof NotificationItem> = {
  title: 'Notifications/NotificationItem',
  component: NotificationItem,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithCount: Story = { args: { count: 5 } };
