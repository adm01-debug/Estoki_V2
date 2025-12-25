import type { Meta, StoryObj } from '@storybook/react';
import CurrencyInput from './CurrencyInput';

const meta: Meta<typeof CurrencyInput> = {
  title: 'Forms/CurrencyInput',
  component: CurrencyInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
export const WithError: Story = { args: { error: 'Required field' } };
