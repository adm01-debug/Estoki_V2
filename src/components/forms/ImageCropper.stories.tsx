import type { Meta, StoryObj } from '@storybook/react';
import ImageCropper from './ImageCropper';

const meta: Meta<typeof ImageCropper> = {
  title: 'Forms/ImageCropper',
  component: ImageCropper,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
