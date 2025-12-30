import type { Meta, StoryObj } from '@storybook/react';
import { OnlineIndicator } from './OnlineIndicator';

const meta: Meta<typeof OnlineIndicator> = {
  title: 'Common/OnlineIndicator',
  component: OnlineIndicator,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Online: Story = { args: { online: true } };
export const Offline: Story = { args: { online: false } };
export const WithLabel: Story = { args: { online: true, showLabel: true } };
