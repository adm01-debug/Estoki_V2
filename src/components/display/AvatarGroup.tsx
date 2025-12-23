import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
interface AvatarGroupProps { users: { name: string; avatar?: string }[]; max?: number; size?: 'sm' | 'md' | 'lg'; }
export function AvatarGroup({ users, max = 4, size = 'md' }: AvatarGroupProps) {
  const sizes = { sm: 'h-6 w-6 text-xs', md: 'h-8 w-8 text-sm', lg: 'h-10 w-10 text-base' };
  const visible = users.slice(0, max);
  const remaining = users.length - max;
  return (
    <TooltipProvider>
      <div className="flex -space-x-2">
        {visible.map((user, i) => (
          <Tooltip key={i}><TooltipTrigger asChild>
            <Avatar className={`${sizes[size]} border-2 border-background`}><AvatarImage src={user.avatar} alt={user.name} /><AvatarFallback>{user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</AvatarFallback></Avatar>
          </TooltipTrigger><TooltipContent>{user.name}</TooltipContent></Tooltip>
        ))}
        {remaining > 0 && <div className={`${sizes[size]} rounded-full bg-muted flex items-center justify-center border-2 border-background font-medium`}>+{remaining}</div>}
      </div>
    </TooltipProvider>
  );
}
