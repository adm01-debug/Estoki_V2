import type { Meta, StoryObj } from '@storybook/react';
import PasskeySettings from '../PasskeySettings';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta: Meta<typeof PasskeySettings> = {
  title: 'Security/PasskeySettings',
  component: PasskeySettings,
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

export const Supported: Story = {
  // Mock isSupported = true
};

export const NotSupported: Story = {
  // Mock isSupported = false
};