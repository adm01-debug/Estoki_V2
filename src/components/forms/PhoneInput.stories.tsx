import type { Meta, StoryObj } from '@storybook/react';
import PhoneInput from './PhoneInput';

const meta: Meta<typeof PhoneInput> = {
  title: 'Forms/PhoneInput',
  component: PhoneInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
