import type { Meta, StoryObj } from '@storybook/react';
import SignaturePad from './SignaturePad';

const meta: Meta<typeof SignaturePad> = {
  title: 'Forms/SignaturePad',
  component: SignaturePad,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
