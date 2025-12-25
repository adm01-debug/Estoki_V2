import type { Meta, StoryObj } from '@storybook/react';
import CompanyCard from './CompanyCard';

const meta: Meta<typeof CompanyCard> = {
  title: 'Display/CompanyCard',
  component: CompanyCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithData: Story = { args: { data: 'Sample' } };
export const Large: Story = { args: { size: 'lg' } };
