import type { Meta, StoryObj } from '@storybook/react';
import { UserMenu } from './UserMenu';

const meta: Meta<typeof UserMenu> = {
  title: 'User/UserMenu',
  component: UserMenu,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

const user = { name: 'João Silva', email: 'joao@empresa.com', avatar: '/avatar.png' };

export const Default: Story = { args: { user } };
export const WithRole: Story = { args: { user: { ...user, role: 'Administrador' } } };
