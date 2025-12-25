import type { Meta, StoryObj } from '@storybook/react';
import TreeSelect from './TreeSelect';

const meta: Meta<typeof TreeSelect> = {
  title: 'Forms/TreeSelect',
  component: TreeSelect,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
