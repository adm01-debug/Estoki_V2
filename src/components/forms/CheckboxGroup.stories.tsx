import type { Meta, StoryObj } from '@storybook/react';
import CheckboxGroup from './CheckboxGroup';

const meta: Meta<typeof CheckboxGroup> = {
  title: 'Forms/CheckboxGroup',
  component: CheckboxGroup,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
export const WithError: Story = { args: { error: 'Required field' } };
