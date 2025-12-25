import type { Meta, StoryObj } from '@storybook/react';
import XPBar from './XPBar';

const meta: Meta<typeof XPBar> = {
  title: 'Gamificacao/XPBar',
  component: XPBar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithValue: Story = { args: { value: 100 } };
