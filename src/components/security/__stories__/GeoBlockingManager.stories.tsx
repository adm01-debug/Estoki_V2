import type { Meta, StoryObj } from '@storybook/react';
import { GeoBlockingManager } from '../GeoBlockingManager';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta: Meta<typeof GeoBlockingManager> = {
  title: 'Security/GeoBlockingManager',
  component: GeoBlockingManager,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="p-6 max-w-4xl mx-auto">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};