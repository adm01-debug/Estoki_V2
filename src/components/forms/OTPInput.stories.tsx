import type { Meta, StoryObj } from '@storybook/react';
import OTPInput from './OTPInput';

const meta: Meta<typeof OTPInput> = {
  title: 'Forms/OTPInput',
  component: OTPInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
