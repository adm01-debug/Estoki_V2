import type { Meta, StoryObj } from "@storybook/react";
import { LoadingFallback } from "./LoadingFallback";

const meta: Meta<typeof LoadingFallback> = {
  title: "Common/LoadingFallback",
  component: LoadingFallback,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof LoadingFallback>;

export const Default: Story = {};