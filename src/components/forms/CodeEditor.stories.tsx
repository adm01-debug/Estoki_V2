import type { Meta, StoryObj } from '@storybook/react';
import CodeEditor from './CodeEditor';

const meta: Meta<typeof CodeEditor> = {
  title: 'Forms/CodeEditor',
  component: CodeEditor,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
export const WithError: Story = { args: { error: 'Required field' } };
