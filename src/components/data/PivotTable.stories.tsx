import type { Meta, StoryObj } from '@storybook/react';
import PivotTable from './PivotTable';

const meta: Meta<typeof PivotTable> = {
  title: 'Data/PivotTable',
  component: PivotTable,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithData: Story = { args: { data: [{ id: 1, name: 'Item 1' }] } };
export const Loading: Story = { args: { isLoading: true } };
export const Empty: Story = { args: { data: [] } };
