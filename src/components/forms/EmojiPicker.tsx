import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Smile } from 'lucide-react';
const EMOJI_CATEGORIES = {
  smileys: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😋', '😛', '🤔', '🤨', '😐', '😑'],
  gestures: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '🙏'],
  hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️'],
  objects: ['⭐', '🌟', '✨', '💥', '🔥', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🎯', '💡', '📌', '📍', '🔔', '🔕', '📢', '📣', '💬']
};
interface EmojiPickerProps { onSelect: (emoji: string) => void; }
export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [category, setCategory] = useState<keyof typeof EMOJI_CATEGORIES>('smileys');
  return (
    <Popover>
      <PopoverTrigger asChild><Button variant="outline" size="icon"><Smile className="h-4 w-4" /></Button></PopoverTrigger>
      <PopoverContent className="w-72 p-2">
        <div className="flex gap-1 mb-2 border-b pb-2">{Object.keys(EMOJI_CATEGORIES).map(cat => <Button key={cat} variant={category === cat ? 'secondary' : 'ghost'} size="sm" onClick={() => setCategory(cat as any)} className="text-xs capitalize">{cat}</Button>)}</div>
        <div className="grid grid-cols-10 gap-1">{EMOJI_CATEGORIES[category].map(emoji => <button key={emoji} onClick={() => onSelect(emoji)} className="text-xl hover:bg-muted rounded p-1">{emoji}</button>)}</div>
      </PopoverContent>
    </Popover>
  );
}
