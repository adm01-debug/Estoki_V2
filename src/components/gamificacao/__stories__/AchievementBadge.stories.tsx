import type { Meta, StoryObj } from '@storybook/react';
import { AchievementBadge } from '../AchievementBadge';

const meta: Meta<typeof AchievementBadge> = {
  title: 'Gamificacao/AchievementBadge',
  component: AchievementBadge,
  decorators: [
    (Story) => (
      <div className="p-6 flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Desbloqueado: Story = {
  args: {
    icon: 'trophy',
    name: 'Mestre da Conferência',
    unlocked: true,
    size: 'md',
  },
};

export const Bloqueado: Story = {
  args: {
    icon: 'star',
    name: 'Estrela Ascendente',
    unlocked: false,
    size: 'md',
  },
};

export const Grande: Story = {
  args: {
    icon: 'flame',
    name: 'Fogo nos Pés',
    unlocked: true,
    size: 'lg',
  },
};

export const Pequeno: Story = {
  args: {
    icon: 'award',
    name: 'Destaque do Mês',
    unlocked: true,
    size: 'sm',
  },
};
