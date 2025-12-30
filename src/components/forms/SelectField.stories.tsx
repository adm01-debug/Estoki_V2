import type { Meta, StoryObj } from '@storybook/react';
import { SelectField } from './SelectField';

const meta: Meta<typeof SelectField> = {
  title: 'Forms/SelectField',
  component: SelectField,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { value: 'sp', label: 'São Paulo' },
  { value: 'rj', label: 'Rio de Janeiro' },
  { value: 'mg', label: 'Minas Gerais' },
];

export const Default: Story = { args: { label: 'Estado', options } };
export const WithPlaceholder: Story = { args: { label: 'Estado', options, placeholder: 'Selecione...' } };
export const Disabled: Story = { args: { label: 'Estado', options, disabled: true } };
