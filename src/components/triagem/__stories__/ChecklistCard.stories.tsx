import type { Meta, StoryObj } from "@storybook/react";
import { ChecklistCard } from "../formulario/ChecklistCard";
import { useState } from "react";
import { checklistItems } from "../formulario/constants";

const meta = {
  title: "Triagem/Formulario/ChecklistCard",
  component: ChecklistCard,
  tags: ["autodocs"],
} satisfies Meta<typeof ChecklistCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const Demo = (args: any) => {
  const [checklist, setChecklist] = useState<Record<string, boolean>>(args.checklist || {});

  const handleChange = (id: string, checked: boolean) => {
    setChecklist((prev) => ({ ...prev, [id]: checked }));
  };

  return (
    <div className="w-[450px]">
      <ChecklistCard {...args} checklist={checklist} onChecklistChange={handleChange} />
    </div>
  );
};

export const Vazio: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    checklist: {},
  },
};

export const Parcial: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    checklist: {
      [checklistItems[0].id]: true,
      [checklistItems[1].id]: true,
    },
  },
};

export const Completo: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    checklist: checklistItems.reduce((acc, item) => ({ ...acc, [item.id]: true }), {}),
  },
};