import type { Meta, StoryObj } from '@storybook/react';
import MapPopup from './MapPopup';

const meta: Meta<typeof MapPopup> = {
  title: 'Maps/MapPopup',
  component: MapPopup,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithMarkers: Story = { args: { markers: [{ lat: -23.5, lng: -46.6 }] } };
