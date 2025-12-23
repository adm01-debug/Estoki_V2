import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface MapPopupProps { children: React.ReactNode; position?: [number, number]; onClose?: () => void; className?: string; }
export function MapPopup({ children, position, onClose, className }: MapPopupProps) {
  return (
    <Card className={`absolute z-10 min-w-48 ${className}`} style={{ left: '50%', top: '40%', transform: 'translateX(-50%)' }}>
      {onClose && <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={onClose}><X className="h-4 w-4" /></Button>}
      <CardContent className="p-3">{children}</CardContent>
    </Card>
  );
}
