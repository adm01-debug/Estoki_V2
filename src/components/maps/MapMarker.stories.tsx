import type { Meta, StoryObj } from '@storybook/react';
import MapMarker from './MapMarker';

const meta: Meta<typeof MapMarker> = {
  title: 'Maps/MapMarker',
  component: MapMarker,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithMarkers: Story = { args: { markers: [{ lat: -23.5, lng: -46.6 }] } };
