import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
interface RatingProps { value: number; onChange?: (value: number) => void; max?: number; size?: 'sm' | 'md' | 'lg'; readOnly?: boolean; }
const sizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' };
export function Rating({ value, onChange, max = 5, size = 'md', readOnly }: RatingProps) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} className={cn(sizes[size], 'cursor-pointer transition-colors', (hover || value) > i ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300', readOnly && 'cursor-default')}
          onClick={() => !readOnly && onChange?.(i + 1)} onMouseEnter={() => !readOnly && setHover(i + 1)} onMouseLeave={() => setHover(0)} />
      ))}
    </div>
  );
}
