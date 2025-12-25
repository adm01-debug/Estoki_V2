import type { Meta, StoryObj } from '@storybook/react';
import TimePicker from './TimePicker';

const meta: Meta<typeof TimePicker> = {
  title: 'Forms/TimePicker',
  component: TimePicker,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
