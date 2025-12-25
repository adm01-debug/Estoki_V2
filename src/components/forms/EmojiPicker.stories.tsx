import type { Meta, StoryObj } from '@storybook/react';
import EmojiPicker from './EmojiPicker';

const meta: Meta<typeof EmojiPicker> = {
  title: 'Forms/EmojiPicker',
  component: EmojiPicker,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
