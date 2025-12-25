import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import Tour from './Tour';

const meta: Meta<typeof Tour> = {
  title: 'Navigation/Tour',
  component: Tour,
  decorators: [(Story) => <BrowserRouter><Story /></BrowserRouter>],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
