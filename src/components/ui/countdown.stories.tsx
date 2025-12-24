import type { Meta, StoryObj } from '@storybook/react';
import { Countdown } from './countdown';

const meta: Meta<typeof Countdown> = {
  title: 'UI/Countdown',
  component: Countdown,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const Playground: Story = { args: {} };
