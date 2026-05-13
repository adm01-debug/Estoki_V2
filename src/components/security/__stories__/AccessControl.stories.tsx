import type { Meta, StoryObj } from '@storybook/react';
import { AccessControl } from '../AccessControl';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta: Meta<typeof AccessControl> = {
  title: 'Security/AccessControl',
  component: AccessControl,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div className="p-6 max-w-5xl mx-auto">
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

export const AdminView: Story = {
  parameters: {
    mockData: [
      {
        url: '/auth/v1/user',
        method: 'GET',
        status: 200,
        response: {
          id: 'admin-id',
          email: 'admin@estoki.com.br',
          user_metadata: { role: 'admin' },
        },
      },
    ],
  },
};

export const OperatorView: Story = {
  parameters: {
    mockData: [
      {
        url: '/auth/v1/user',
        method: 'GET',
        status: 200,
        response: {
          id: 'op-id',
          email: 'operador@estoki.com.br',
          user_metadata: { role: 'operador' },
        },
      },
    ],
  },
};