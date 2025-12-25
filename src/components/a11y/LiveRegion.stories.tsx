import type { Meta, StoryObj } from '@storybook/react';
import LiveRegion from './LiveRegion';

const meta: Meta<typeof LiveRegion> = {
  title: 'A11y/LiveRegion',
  component: LiveRegion,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Accessible content' } };
