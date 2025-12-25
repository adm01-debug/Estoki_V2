import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import ContextMenu from './ContextMenu';

const meta: Meta<typeof ContextMenu> = {
  title: 'Navigation/ContextMenu',
  component: ContextMenu,
  decorators: [(Story) => <BrowserRouter><Story /></BrowserRouter>],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
