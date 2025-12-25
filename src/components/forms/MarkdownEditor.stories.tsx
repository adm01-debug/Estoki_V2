import type { Meta, StoryObj } from '@storybook/react';
import MarkdownEditor from './MarkdownEditor';

const meta: Meta<typeof MarkdownEditor> = {
  title: 'Forms/MarkdownEditor',
  component: MarkdownEditor,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
