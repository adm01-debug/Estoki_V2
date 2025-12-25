import type { Meta, StoryObj } from '@storybook/react';
import FilePreview from './FilePreview';

const meta: Meta<typeof FilePreview> = {
  title: 'Forms/FilePreview',
  component: FilePreview,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
