import type { Meta, StoryObj } from "@storybook/react";
import { ProductCard } from "./ProductCard";

const meta: Meta<typeof ProductCard> = {
  title: "WMS/ProductCard",
  component: ProductCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ProductCard>;

export const Default: Story = {
  args: {
    name: "Smartphone Android 13 - 128GB",
    sku: "TEL-AND-128",
    barcode: "7891234567890",
    category: "Eletrônicos",
    quantity: 45,
    unit: "un",
    location: "A-12-03",
    status: "active",
  },
};

export const ComImagem: Story = {
  args: {
    name: "Cadeira Ergonômica Office",
    sku: "CAD-ERG-001",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    quantity: 12,
    unit: "un",
    location: "B-05-01",
    status: "active",
  },
};

export const VencendoEmBreve: Story = {
  args: {
    name: "Caixa de Papelão 30x30",
    sku: "EMB-CAI-030",
    quantity: 1500,
    unit: "pct",
    location: "S-01-10",
    expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10), // 10 dias
    status: "active",
  },
};

export const Descontinuado: Story = {
  args: {
    name: "Cabo HDMI 1.4 - 1.5m",
    sku: "CAB-HDM-1.4",
    quantity: 0,
    status: "discontinued",
  },
};