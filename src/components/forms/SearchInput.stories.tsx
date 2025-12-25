import type { Meta, StoryObj } from '@storybook/react';
import SearchInput from './SearchInput';

const meta: Meta<typeof SearchInput> = {
  title: 'Forms/SearchInput',
  component: SearchInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
