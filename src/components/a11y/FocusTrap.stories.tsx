import type { Meta, StoryObj } from '@storybook/react';
import FocusTrap from './FocusTrap';

const meta: Meta<typeof FocusTrap> = {
  title: 'A11y/FocusTrap',
  component: FocusTrap,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Accessible content' } };
