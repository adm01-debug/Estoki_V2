import type { Meta, StoryObj } from "@storybook/react";
import { KeyboardShortcutsHelp } from "./KeyboardShortcuts";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof KeyboardShortcutsHelp> = {
  title: "Common/KeyboardShortcutsHelp",
  component: KeyboardShortcutsHelp,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof KeyboardShortcutsHelp>;

const Demo = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Ver Atalhos (?)</Button>
      <KeyboardShortcutsHelp open={open} onOpenChange={setOpen} />
    </div>
  );
};

export const Default: Story = {
  render: () => <Demo />,
};