import type { Meta, StoryObj } from '@storybook/react';
import MapRoute from './MapRoute';

const meta: Meta<typeof MapRoute> = {
  title: 'Maps/MapRoute',
  component: MapRoute,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithMarkers: Story = { args: { markers: [{ lat: -23.5, lng: -46.6 }] } };
