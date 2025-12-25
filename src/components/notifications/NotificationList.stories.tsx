import type { Meta, StoryObj } from '@storybook/react';
import NotificationList from './NotificationList';

const meta: Meta<typeof NotificationList> = {
  title: 'Notifications/NotificationList',
  component: NotificationList,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithCount: Story = { args: { count: 5 } };
