import type { Meta, StoryObj } from '@storybook/react';
import { ConfirmDialog } from './confirm-dialog';

const meta: Meta<typeof ConfirmDialog> = {
  title: 'UI/ConfirmDialog',
  component: ConfirmDialog,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const Playground: Story = { args: {} };
