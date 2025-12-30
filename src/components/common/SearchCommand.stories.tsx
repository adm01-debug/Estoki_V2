import type { Meta, StoryObj } from '@storybook/react';
import { SearchCommand } from './SearchCommand';

const meta: Meta<typeof SearchCommand> = {
  title: 'Common/SearchCommand',
  component: SearchCommand,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithPlaceholder: Story = { args: { placeholder: 'Buscar produtos...' } };
export const WithShortcut: Story = { args: { shortcut: 'Ctrl+K' } };
