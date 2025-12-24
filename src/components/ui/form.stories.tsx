import type { Meta, StoryObj } from '@storybook/react';
import { Form } from './form';

const meta: Meta<typeof Form> = {
  title: 'UI/Form',
  component: Form,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const Playground: Story = { args: {} };
