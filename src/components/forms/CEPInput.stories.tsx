import type { Meta, StoryObj } from '@storybook/react';
import CEPInput from './CEPInput';

const meta: Meta<typeof CEPInput> = {
  title: 'Forms/CEPInput',
  component: CEPInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
export const WithError: Story = { args: { error: 'Required field' } };
