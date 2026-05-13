import type { Meta, StoryObj } from '@storybook/react';
import { ConquistasSystem } from '../ConquistasSystem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta: Meta<typeof ConquistasSystem> = {
  title: 'Gamificacao/ConquistasSystem',
  component: ConquistasSystem,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="p-6 max-w-lg mx-auto">
            <Story />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
