import type { Meta, StoryObj } from '@storybook/react';
import MonthPicker from './MonthPicker';

const meta: Meta<typeof MonthPicker> = {
  title: 'Forms/MonthPicker',
  component: MonthPicker,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
