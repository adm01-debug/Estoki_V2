import type { Meta, StoryObj } from '@storybook/react';
import MobileNav from './MobileNav';

const meta: Meta<typeof MobileNav> = {
  title: 'Mobile/MobileNav',
  component: MobileNav,
  parameters: { layout: 'fullscreen', viewport: { defaultViewport: 'mobile1' } },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
