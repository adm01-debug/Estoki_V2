import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
interface QRCodeProps { value: string; size?: number; level?: 'L' | 'M' | 'Q' | 'H'; includeMargin?: boolean; className?: string; }
export function QRCode({ value, size = 128, level = 'M', includeMargin = true, className }: QRCodeProps) {
  return <div className={className}><QRCodeSVG value={value} size={size} level={level} includeMargin={includeMargin} /></div>;
}
