import type { Meta, StoryObj } from '@storybook/react';
import SwipeAction from './SwipeAction';

const meta: Meta<typeof SwipeAction> = {
  title: 'Mobile/SwipeAction',
  component: SwipeAction,
  parameters: { layout: 'fullscreen', viewport: { defaultViewport: 'mobile1' } },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
