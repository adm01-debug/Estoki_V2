import type { Meta, StoryObj } from '@storybook/react';
import AvatarGroup from './AvatarGroup';

const meta: Meta<typeof AvatarGroup> = {
  title: 'Display/AvatarGroup',
  component: AvatarGroup,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithData: Story = { args: { data: 'Sample' } };
export const Large: Story = { args: { size: 'lg' } };
