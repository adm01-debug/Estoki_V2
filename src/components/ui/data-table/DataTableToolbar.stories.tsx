import type { Meta, StoryObj } from "@storybook/react";
import { DataTableToolbar } from "./DataTableToolbar";
import { useState } from "react";

const meta: Meta<typeof DataTableToolbar> = {
  title: "UI/DataTable/Toolbar",
  component: DataTableToolbar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DataTableToolbar>;

const ToolbarDemo = (args: any) => {
  const [filter, setFilter] = useState("");
  const [visibility, setVisibility] = useState<Record<string, boolean>>({
    id: true,
    name: true,
    status: true,
    date: true,
  });

  const toggleVisibility = (key: string) => {
    setVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <DataTableToolbar
      {...args}
      globalFilter={filter}
      setGlobalFilter={setFilter}
      columnVisibility={visibility}
      toggleColumnVisibility={toggleVisibility}
    />
  );
};

const columns = [
  { key: "id", header: "ID" },
  { key: "name", header: "Nome" },
  { key: "status", header: "Status" },
  { key: "date", header: "Data" },
];

export const Default: Story = {
  render: (args) => <ToolbarDemo {...args} />,
  args: {
    filterable: true,
    exportable: true,
    isExporting: false,
    columns,
    onExport: (format: string) => alert(`Exportando como ${format}`),
  },
};

export const SearchOnly: Story = {
  render: (args) => <ToolbarDemo {...args} />,
  args: {
    filterable: true,
    exportable: false,
    isExporting: false,
    columns,
  },
};

export const Exporting: Story = {
  render: (args) => <ToolbarDemo {...args} />,
  args: {
    filterable: true,
    exportable: true,
    isExporting: true,
    columns,
  },
};