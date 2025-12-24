import type { Meta, StoryObj } from '@storybook/react';
import { AvatarGroup } from './avatar-group';

const meta: Meta<typeof AvatarGroup> = {
  title: 'UI/AvatarGroup',
  component: AvatarGroup,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const Playground: Story = { args: {} };
