import type { Meta, StoryObj } from '@storybook/react';
import NotificationBell from './NotificationBell';

const meta: Meta<typeof NotificationBell> = {
  title: 'Notifications/NotificationBell',
  component: NotificationBell,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithCount: Story = { args: { count: 5 } };
