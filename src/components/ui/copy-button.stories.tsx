import type { Meta, StoryObj } from '@storybook/react';
import { CopyButton } from './copy-button';

const meta: Meta<typeof CopyButton> = {
  title: 'UI/CopyButton',
  component: CopyButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const Playground: Story = { args: {} };
