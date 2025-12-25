import type { Meta, StoryObj } from '@storybook/react';
import RadioCards from './RadioCards';

const meta: Meta<typeof RadioCards> = {
  title: 'Forms/RadioCards',
  component: RadioCards,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
