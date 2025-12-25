import type { Meta, StoryObj } from '@storybook/react';
import Quest from './Quest';

const meta: Meta<typeof Quest> = {
  title: 'Gamificacao/Quest',
  component: Quest,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 100 } };
