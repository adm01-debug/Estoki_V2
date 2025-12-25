import type { Meta, StoryObj } from '@storybook/react';
import SwitchCard from './SwitchCard';

const meta: Meta<typeof SwitchCard> = {
  title: 'Forms/SwitchCard',
  component: SwitchCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
