import type { Meta, StoryObj } from '@storybook/react';
import JsonEditor from './JsonEditor';

const meta: Meta<typeof JsonEditor> = {
  title: 'Forms/JsonEditor',
  component: JsonEditor,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 'test' } };
export const Disabled: Story = { args: { disabled: true } };
