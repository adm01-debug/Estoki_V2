import type { Meta, StoryObj } from '@storybook/react';
import { MFASettings } from '../MFASettings';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta: Meta<typeof MFASettings> = {
  title: 'Security/MFASettings',
  component: MFASettings,
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

export const EnabledMFA: Story = {
  // Mocks seriam configurados aqui para simular fatores verificados
};