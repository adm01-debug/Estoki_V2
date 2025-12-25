import type { Meta, StoryObj } from '@storybook/react';
import PullToRefresh from './PullToRefresh';

const meta: Meta<typeof PullToRefresh> = {
  title: 'Mobile/PullToRefresh',
  component: PullToRefresh,
  parameters: { layout: 'fullscreen', viewport: { defaultViewport: 'mobile1' } },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
