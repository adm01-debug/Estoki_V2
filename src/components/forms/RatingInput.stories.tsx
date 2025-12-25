import type { Meta, StoryObj } from '@storybook/react';
import RatingInput from './RatingInput';

const meta: Meta<typeof RatingInput> = {
  title: 'Forms/RatingInput',
  component: RatingInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
