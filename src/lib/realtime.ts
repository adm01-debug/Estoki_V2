import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export const createRealtimeChannel = (
  channelName: string,
  table: string,
  callback: () => void
): RealtimeChannel => {
  return supabase
    .channel(channelName)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe();
};

export const removeChannel = (channel: RealtimeChannel) => {
  supabase.removeChannel(channel);
};
