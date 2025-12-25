import type { Meta, StoryObj } from '@storybook/react';
import YearPicker from './YearPicker';

const meta: Meta<typeof YearPicker> = {
  title: 'Forms/YearPicker',
  component: YearPicker,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
