import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
interface RangeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: [number, number];
  onChange?: (value: [number, number]) => void;
  label?: string;
  formatValue?: (value: number) => string;
}
export function RangeSlider({
  min = 0,
  max = 100,
  step = 1,
  value = [25, 75],
  onChange,
  label,
  formatValue = (v) => String(v),
}: RangeSliderProps) {
  const [minVal, maxVal] = value;
  const minPercent = ((minVal - min) / (max - min)) * 100;
  const maxPercent = ((maxVal - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="relative h-2 rounded-full bg-muted">
        <div
          className="absolute h-full rounded-full bg-primary"
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={(e) => onChange?.([Math.min(Number(e.target.value), maxVal - step), maxVal])}
          className="absolute h-full w-full cursor-pointer opacity-0"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={(e) => onChange?.([minVal, Math.max(Number(e.target.value), minVal + step)])}
          className="absolute h-full w-full cursor-pointer opacity-0"
        />
        <div
          className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary"
          style={{ left: `${minPercent}%` }}
        />
        <div
          className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary"
          style={{ left: `${maxPercent}%` }}
        />
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{formatValue(minVal)}</span>
        <span>{formatValue(maxVal)}</span>
      </div>
    </div>
  );
}
