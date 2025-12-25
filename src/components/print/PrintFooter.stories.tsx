import type { Meta, StoryObj } from '@storybook/react';
import PrintFooter from './PrintFooter';

const meta: Meta<typeof PrintFooter> = {
  title: 'Print/PrintFooter',
  component: PrintFooter,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Print content' } };
