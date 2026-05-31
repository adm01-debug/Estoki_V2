import React from "react";
import { Badge } from "@/components/ui/badge";
interface MapClusterProps {
  count: number;
  position: [number, number];
  onClick?: () => void;
  color?: string;
}
export function MapCluster({ count, position, onClick, color = "#3b82f6" }: MapClusterProps) {
  const size = count > 100 ? 48 : count > 10 ? 40 : 32;
  return (
    <div
      className="absolute cursor-pointer"
      onClick={onClick}
      style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
    >
      <div
        className="flex items-center justify-center rounded-full font-bold text-white shadow-lg"
        style={{ width: size, height: size, backgroundColor: color }}
      >
        {count}
      </div>
    </div>
  );
}
