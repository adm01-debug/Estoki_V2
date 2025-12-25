import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import Wizard from './Wizard';

const meta: Meta<typeof Wizard> = {
  title: 'Navigation/Wizard',
  component: Wizard,
  decorators: [(Story) => <BrowserRouter><Story /></BrowserRouter>],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
