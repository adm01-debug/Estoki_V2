import type { Meta, StoryObj } from '@storybook/react';
import { InputOtp } from './input-otp';

const meta: Meta<typeof InputOtp> = {
  title: 'UI/InputOtp',
  component: InputOtp,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const Playground: Story = { args: {} };
