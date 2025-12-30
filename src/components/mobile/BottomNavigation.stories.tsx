import type { Meta, StoryObj } from '@storybook/react';
import { BottomNavigation } from './BottomNavigation';
import { Home, Package, Scan, User } from 'lucide-react';

const meta: Meta<typeof BottomNavigation> = {
  title: 'Mobile/BottomNavigation',
  component: BottomNavigation,
  parameters: { layout: 'fullscreen', viewport: { defaultViewport: 'mobile1' } },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

const items = [
  { id: 'home', label: 'Início', icon: Home, path: '/' },
  { id: 'estoque', label: 'Estoque', icon: Package, path: '/estoque' },
  { id: 'scan', label: 'Escanear', icon: Scan, path: '/scan' },
  { id: 'perfil', label: 'Perfil', icon: User, path: '/perfil' },
];

export const Default: Story = { args: { items, activeId: 'home' } };
export const WithBadge: Story = { args: { items: items.map(i => i.id === 'estoque' ? { ...i, badge: '5' } : i), activeId: 'home' } };
