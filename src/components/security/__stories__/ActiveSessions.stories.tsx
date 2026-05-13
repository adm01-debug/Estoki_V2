import type { Meta, StoryObj } from '@storybook/react';
import { ActiveSessions } from '../ActiveSessions';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta: Meta<typeof ActiveSessions> = {
  title: 'Security/ActiveSessions',
  component: ActiveSessions,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div className="p-6 max-w-4xl mx-auto">
            <Story />
          </div>
        </AuthProvider>
      </QueryClientProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMultipleSessions: Story = {
  // Mocks seriam configurados aqui se usássemos msw-storybook-addon
};