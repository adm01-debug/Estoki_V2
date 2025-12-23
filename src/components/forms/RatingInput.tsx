import React from 'react';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
interface RatingInputProps { value?: number; onChange?: (value: number) => void; max?: number; label?: string; size?: 'sm' | 'md' | 'lg'; allowHalf?: boolean; readonly?: boolean; }
export function RatingInput({ value = 0, onChange, max = 5, label, size = 'md', allowHalf = false, readonly = false }: RatingInputProps) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };
  const handleClick = (rating: number) => { if (!readonly) onChange?.(rating); };
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex gap-1">{Array.from({ length: max }, (_, i) => {
        const rating = i + 1;
        const filled = value >= rating;
        const halfFilled = allowHalf && value >= rating - 0.5 && value < rating;
        return (
          <button key={i} type="button" onClick={() => handleClick(rating)} className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`} disabled={readonly}>
            <Star className={`${sizes[size]} ${filled ? 'fill-yellow-400 text-yellow-400' : halfFilled ? 'fill-yellow-400/50 text-yellow-400' : 'text-muted-foreground'}`} />
          </button>
        );
      })}</div>
    </div>
  );
}
