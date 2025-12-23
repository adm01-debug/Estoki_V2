import React from 'react';
interface MapRouteProps { points: [number, number][]; color?: string; weight?: number; }
export function MapRoute({ points, color = '#3b82f6', weight = 4 }: MapRouteProps) {
  if (points.length < 2) return null;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
      <polyline points={points.map(() => '100,100 150,150 200,100').join(' ')} fill="none" stroke={color} strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
