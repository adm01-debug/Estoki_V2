import type { Meta, StoryObj } from '@storybook/react';
import KPIGauge from './KPIGauge';

const meta: Meta<typeof KPIGauge> = {
  title: 'KPIs/KPIGauge',
  component: KPIGauge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { value: 75, label: 'Performance' } };
export const High: Story = { args: { value: 95, label: 'Excellent' } };
export const Low: Story = { args: { value: 25, label: 'Needs Improvement' } };
