import type { Meta, StoryObj } from '@storybook/react';
import { TextareaField } from './TextareaField';

const meta: Meta<typeof TextareaField> = {
  title: 'Forms/TextareaField',
  component: TextareaField,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { label: 'Descrição', name: 'description' } };
export const WithRows: Story = { args: { label: 'Observações', name: 'notes', rows: 6 } };
export const WithMaxLength: Story = { args: { label: 'Bio', name: 'bio', maxLength: 200 } };
