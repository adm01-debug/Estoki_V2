import type { Meta, StoryObj } from '@storybook/react';
import { FormField } from './FormField';

const meta: Meta<typeof FormField> = {
  title: 'Forms/FormField',
  component: FormField,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { label: 'Nome', name: 'name' } };
export const Required: Story = { args: { label: 'Email', name: 'email', required: true } };
export const WithError: Story = { args: { label: 'Senha', name: 'password', error: 'Senha muito curta' } };
export const WithHelp: Story = { args: { label: 'CPF', name: 'cpf', helpText: 'Apenas números' } };
