import type { Meta, StoryObj } from '@storybook/react';
import { PermissionsManager } from '../PermissionsManager';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta: Meta<typeof PermissionsManager> = {
  title: 'Security/PermissionsManager',
  component: PermissionsManager,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="p-6 max-w-5xl mx-auto">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const OperatorRole: Story = {
  // Mock para papel de operador selecionado
};

export const AdminRole: Story = {
  // Mock para papel de admin selecionado
};