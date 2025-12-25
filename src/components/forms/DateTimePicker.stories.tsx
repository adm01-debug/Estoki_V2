import type { Meta, StoryObj } from '@storybook/react';
import DateTimePicker from './DateTimePicker';

const meta: Meta<typeof DateTimePicker> = {
  title: 'Forms/DateTimePicker',
  component: DateTimePicker,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
