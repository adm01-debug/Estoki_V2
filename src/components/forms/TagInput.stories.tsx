import type { Meta, StoryObj } from '@storybook/react';
import TagInput from './TagInput';

const meta: Meta<typeof TagInput> = {
  title: 'Forms/TagInput',
  component: TagInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
