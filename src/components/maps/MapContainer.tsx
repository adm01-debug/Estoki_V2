import React from 'react';
interface MapContainerProps { children?: React.ReactNode; center?: [number, number]; zoom?: number; height?: string; className?: string; }
export function MapContainer({ children, center = [-23.5505, -46.6333], zoom = 13, height = '400px', className }: MapContainerProps) {
  return (
    <div className={`relative rounded-lg overflow-hidden bg-muted ${className}`} style={{ height }}>
      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
        <div className="text-center"><p className="text-sm">Mapa</p><p className="text-xs">Lat: {center[0].toFixed(4)}, Lng: {center[1].toFixed(4)}</p><p className="text-xs">Zoom: {zoom}</p></div>
      </div>
      {children}
    </div>
  );
}
