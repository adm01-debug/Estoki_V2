import type { Meta, StoryObj } from "@storybook/react";
import { ScannerOCR } from "./ScannerOCR";
import { Toaster } from "sonner";

const meta: Meta<typeof ScannerOCR> = {
  title: "Scanner/ScannerOCR",
  component: ScannerOCR,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ScannerOCR>;

export const Default: Story = {
  render: () => (
    <div className="max-w-md mx-auto p-4">
      <ScannerOCR />
      <Toaster />
    </div>
  ),
};