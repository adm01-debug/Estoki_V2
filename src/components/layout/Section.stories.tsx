import type { Meta, StoryObj } from '@storybook/react';
import Section from './Section';

const meta: Meta<typeof Section> = {
  title: 'Layout/Section',
  component: Section,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithChildren: Story = { args: { children: 'Content' } };
export const CustomClass: Story = { args: { className: 'custom' } };
