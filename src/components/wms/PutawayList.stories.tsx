import type { Meta, StoryObj } from '@storybook/react';
import PutawayList from './PutawayList';

const meta: Meta<typeof PutawayList> = {
  title: 'WMS/PutawayList',
  component: PutawayList,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };

export const WithData: Story = {
  args: { data: { id: '1', status: 'active' } },
};

export const Variant: Story = {
  args: { variant: 'compact' },
};
