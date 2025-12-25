import type { Meta, StoryObj } from '@storybook/react';
import Autocomplete from './Autocomplete';

const meta: Meta<typeof Autocomplete> = {
  title: 'Forms/Autocomplete',
  component: Autocomplete,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
export const WithError: Story = { args: { error: 'Required field' } };
