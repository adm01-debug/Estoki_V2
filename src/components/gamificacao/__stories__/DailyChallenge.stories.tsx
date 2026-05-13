import type { Meta, StoryObj } from '@storybook/react';
import { DailyChallenge } from '../DailyChallenge';

const meta: Meta<typeof DailyChallenge> = {
  title: 'Gamificacao/DailyChallenge',
  component: DailyChallenge,
  decorators: [
    (Story) => (
      <div className="p-6 max-w-md mx-auto">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Conferir 50 itens',
    progress: 12,
    goal: 50,
    xp: 250,
  },
};

export const QuaseCompleto: Story = {
  args: {
    title: 'Finalizar 5 triagens',
    progress: 4,
    goal: 5,
    xp: 500,
  },
};

export const Concluido: Story = {
  args: {
    title: 'Bater meta diária',
    progress: 100,
    goal: 100,
    xp: 1000,
    completed: true,
  },
};
