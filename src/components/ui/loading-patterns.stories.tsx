import type { Meta, StoryObj } from "@storybook/react";
import { 
  PageSkeleton, 
  CardSkeleton, 
  KPIGridSkeleton, 
  TableSkeleton, 
  BrandedSpinner, 
  FullPageLoader,
  InlineLoader
} from "./loading-patterns";

const meta: Meta = {
  title: "UI/LoadingPatterns",
  tags: ["autodocs"],
};

export default meta;

export const Page: StoryObj = { render: () => <PageSkeleton /> };
export const Card: StoryObj = { render: () => <CardSkeleton className="max-w-md" /> };
export const KPIGrid: StoryObj = { render: () => <KPIGridSkeleton /> };
export const Table: StoryObj = { render: () => <TableSkeleton /> };
export const Spinner: StoryObj = { 
  render: () => <BrandedSpinner size="md" text="Processando dados..." /> 
};
export const FullPage: StoryObj = { render: () => <FullPageLoader /> };
export const Inline: StoryObj = { render: () => <InlineLoader /> };