import React from 'react';
import { MapPin } from 'lucide-react';
interface MapMarkerProps { position: [number, number]; label?: string; color?: string; onClick?: () => void; }
export function MapMarker({ position, label, color = '#ef4444', onClick }: MapMarkerProps) {
  return (
    <div className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-full" onClick={onClick} style={{ left: '50%', top: '50%' }}>
      <MapPin className="h-8 w-8" style={{ color }} />
      {label && <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-background px-2 py-1 rounded text-xs shadow">{label}</div>}
    </div>
  );
}
