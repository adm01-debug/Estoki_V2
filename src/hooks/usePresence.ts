import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
export function usePresence(channelName: string, userId: string) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  useEffect(() => {
    const channel = supabase.channel(channelName);
    channel.on('presence', { event: 'sync' }, () => { const state = channel.presenceState(); setOnlineUsers(Object.keys(state)); })
      .subscribe(async (status) => { if (status === 'SUBSCRIBED') { await channel.track({ user_id: userId }); } });
    return () => { channel.unsubscribe(); };
  }, [channelName, userId]);
  return { onlineUsers, count: onlineUsers.length };
}
