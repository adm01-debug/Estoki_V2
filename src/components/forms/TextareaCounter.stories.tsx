import type { Meta, StoryObj } from '@storybook/react';
import TextareaCounter from './TextareaCounter';

const meta: Meta<typeof TextareaCounter> = {
  title: 'Forms/TextareaCounter',
  component: TextareaCounter,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
