import type { Meta, StoryObj } from '@storybook/react';
import PatternInput from './PatternInput';

const meta: Meta<typeof PatternInput> = {
  title: 'Forms/PatternInput',
  component: PatternInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
