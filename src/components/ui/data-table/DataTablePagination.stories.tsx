import type { Meta, StoryObj } from "@storybook/react";
import { DataTablePagination } from "./DataTablePagination";
import { useState } from "react";

const meta: Meta<typeof DataTablePagination> = {
  title: "UI/DataTable/Pagination",
  component: DataTablePagination,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DataTablePagination>;

const PaginationDemo = (args: any) => {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  return (
    <DataTablePagination
      {...args}
      currentPage={page}
      pageSize={size}
      onPageChange={(p) => typeof p === "function" ? setPage(p) : setPage(p)}
      onPageSizeChange={setSize}
    />
  );
};

export const Default: Story = {
  render: (args) => <PaginationDemo {...args} />,
  args: {
    totalPages: 5,
    totalItems: 48,
    pageSizeOptions: [10, 20, 50],
  },
};

export const SinglePage: Story = {
  args: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 5,
    pageSize: 10,
    pageSizeOptions: [10, 20],
  },
};

export const ManyItems: Story = {
  render: (args) => <PaginationDemo {...args} />,
  args: {
    totalPages: 100,
    totalItems: 1000,
    pageSizeOptions: [10, 20, 50, 100],
  },
};