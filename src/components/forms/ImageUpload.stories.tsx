import type { Meta, StoryObj } from '@storybook/react';
import ImageUpload from './ImageUpload';

const meta: Meta<typeof ImageUpload> = {
  title: 'Forms/ImageUpload',
  component: ImageUpload,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
