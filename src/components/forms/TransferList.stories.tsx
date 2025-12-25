import type { Meta, StoryObj } from '@storybook/react';
import TransferList from './TransferList';

const meta: Meta<typeof TransferList> = {
  title: 'Forms/TransferList',
  component: TransferList,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
