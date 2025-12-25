import type { Meta, StoryObj } from '@storybook/react';
import NotificationBadge from './NotificationBadge';

const meta: Meta<typeof NotificationBadge> = {
  title: 'Notifications/NotificationBadge',
  component: NotificationBadge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithCount: Story = { args: { count: 5 } };
