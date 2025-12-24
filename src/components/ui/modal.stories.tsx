import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './modal';

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const Playground: Story = { args: {} };
