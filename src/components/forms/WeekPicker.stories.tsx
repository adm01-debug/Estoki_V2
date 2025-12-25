import type { Meta, StoryObj } from '@storybook/react';
import WeekPicker from './WeekPicker';

const meta: Meta<typeof WeekPicker> = {
  title: 'Forms/WeekPicker',
  component: WeekPicker,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
