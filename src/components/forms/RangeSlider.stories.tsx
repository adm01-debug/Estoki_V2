import type { Meta, StoryObj } from '@storybook/react';
import RangeSlider from './RangeSlider';

const meta: Meta<typeof RangeSlider> = {
  title: 'Forms/RangeSlider',
  component: RangeSlider,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
