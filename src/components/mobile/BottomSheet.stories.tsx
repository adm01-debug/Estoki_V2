import type { Meta, StoryObj } from '@storybook/react';
import BottomSheet from './BottomSheet';

const meta: Meta<typeof BottomSheet> = {
  title: 'Mobile/BottomSheet',
  component: BottomSheet,
  parameters: { layout: 'fullscreen', viewport: { defaultViewport: 'mobile1' } },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
