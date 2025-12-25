import type { Meta, StoryObj } from '@storybook/react';
import WeightInput from './WeightInput';

const meta: Meta<typeof WeightInput> = {
  title: 'Forms/WeightInput',
  component: WeightInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
