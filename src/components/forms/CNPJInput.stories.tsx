import type { Meta, StoryObj } from '@storybook/react';
import CNPJInput from './CNPJInput';

const meta: Meta<typeof CNPJInput> = {
  title: 'Forms/CNPJInput',
  component: CNPJInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
export const WithError: Story = { args: { error: 'Required field' } };
