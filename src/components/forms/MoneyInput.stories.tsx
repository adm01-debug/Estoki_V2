import type { Meta, StoryObj } from '@storybook/react';
import MoneyInput from './MoneyInput';

const meta: Meta<typeof MoneyInput> = {
  title: 'Forms/MoneyInput',
  component: MoneyInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
