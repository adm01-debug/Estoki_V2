import type { Meta, StoryObj } from '@storybook/react';
import { ProgressRing } from './ProgressRing';

const meta: Meta<typeof ProgressRing> = {
  title: 'Dashboard/ProgressRing',
  component: ProgressRing,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: { progress: { control: { type: 'range', min: 0, max: 100 } } },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { progress: 75 } };
export const Empty: Story = { args: { progress: 0 } };
export const Complete: Story = { args: { progress: 100 } };
export const WithLabel: Story = { args: { progress: 65, label: 'Concluído' } };
