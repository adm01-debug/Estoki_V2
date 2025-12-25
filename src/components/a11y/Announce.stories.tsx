import type { Meta, StoryObj } from '@storybook/react';
import Announce from './Announce';

const meta: Meta<typeof Announce> = {
  title: 'A11y/Announce',
  component: Announce,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Accessible content' } };
