import type { Meta, StoryObj } from '@storybook/react';
import MapCluster from './MapCluster';

const meta: Meta<typeof MapCluster> = {
  title: 'Maps/MapCluster',
  component: MapCluster,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithMarkers: Story = { args: { markers: [{ lat: -23.5, lng: -46.6 }] } };
