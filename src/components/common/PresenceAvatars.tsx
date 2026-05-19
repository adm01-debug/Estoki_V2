import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PresenceState {
  user_id: string;
  nome: string;
  avatar_url?: string;
  color: string;
  online_at: string;
}

const COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 
  'bg-pink-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-teal-500'
];

export function PresenceAvatars() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const [presences, setPresences] = useState<PresenceState[]>([]);
  
  const channelName = `presence:${location.pathname.replace(/\//g, '_')}`;

  useEffect(() => {
    if (!user || !profile) return;

    const userColor = COLORS[Math.abs(user.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % COLORS.length];
    
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state)
          .flat() as unknown as PresenceState[];
        
        const others = users.filter(u => u.user_id !== user.id);
        
        setPresences(others.sort((a, b) => a.online_at.localeCompare(b.online_at)));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            nome: profile.nome || user.email?.split('@')[0] || 'Usuário',
            avatar_url: profile.avatar_url,
            color: userColor,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [channelName, user, profile, location.pathname]);

  if (presences.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center -space-x-2 overflow-hidden px-2">
        <AnimatePresence>
          {presences.slice(0, 5).map((p) => (
            <motion.div
              key={p.user_id}
              initial={{ opacity: 0, x: -10, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative group cursor-default">
                    <Avatar className={cn("h-7 w-7 border-2 border-background ring-1 ring-border/50 transition-transform group-hover:-translate-y-1", p.color)}>
                      <AvatarImage src={p.avatar_url || undefined} />
                      <AvatarFallback className="text-[10px] font-bold text-white uppercase">
                        {p.nome.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border border-background shadow-sm" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <span className="font-semibold">{p.nome}</span> está nesta página
                </TooltipContent>
              </Tooltip>
            </motion.div>
          ))}
          {presences.length > 5 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center h-7 w-7 rounded-full bg-muted border-2 border-background text-[10px] font-medium text-muted-foreground z-10"
            >
              +{presences.length - 5}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}
