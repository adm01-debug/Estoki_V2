import type { Meta, StoryObj } from '@storybook/react';
import FocusScope from './FocusScope';

const meta: Meta<typeof FocusScope> = {
  title: 'A11y/FocusScope',
  component: FocusScope,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Accessible content' } };
