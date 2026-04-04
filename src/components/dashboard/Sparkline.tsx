import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  className?: string;
}

export const Sparkline = memo(function Sparkline({
  data,
  color = "hsl(var(--primary))",
  height = 32,
  width = 80,
  className,
}: SparklineProps) {
  const path = useMemo(() => {
    if (!data || data.length < 2) return "";
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);
    const padding = 2;
    const effectiveHeight = height - padding * 2;

    const points = data.map((v, i) => ({
      x: i * stepX,
      y: padding + effectiveHeight - ((v - min) / range) * effectiveHeight,
    }));

    // Smooth curve using cardinal spline
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  }, [data, width, height]);

  const areaPath = useMemo(() => {
    if (!path) return "";
    return `${path} L ${width} ${height} L 0 ${height} Z`;
  }, [path, width, height]);

  if (!data || data.length < 2) return null;

  const trend = data[data.length - 1] - data[0];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
      aria-hidden="true"
    >
      {/* Area fill */}
      <path
        d={areaPath}
        fill={color}
        fillOpacity={0.1}
      />
      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Current value dot */}
      <circle
        cx={width}
        cy={
          2 +
          (height - 4) -
          ((data[data.length - 1] - Math.min(...data)) /
            (Math.max(...data) - Math.min(...data) || 1)) *
            (height - 4)
        }
        r={2.5}
        fill={color}
      />
    </svg>
  );
});

export default Sparkline;
