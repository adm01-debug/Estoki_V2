import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Zap, Award } from 'lucide-react';
import { RankingEntry } from '@/hooks/useRanking';
import { getPosicaoIcon, getPodiumColor, getInitials, getTendenciaIcon } from './placarHelpers';

interface RankingItemProps {
  entry: RankingEntry;
}

export const RankingItem: React.FC<RankingItemProps> = ({ entry }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: entry.posicao * 0.05 }}
      className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
        entry.posicao <= 3 ? 'bg-accent/50' : 'hover:bg-accent/30'
      }`}
    >
      <div className="w-10 flex justify-center">
        {getPosicaoIcon(entry.posicao)}
      </div>

      <Avatar className={`h-10 w-10 ${entry.posicao <= 3 ? getPodiumColor(entry.posicao) : ''}`}>
        <AvatarFallback className={entry.posicao <= 3 ? 'bg-transparent' : ''}>
          {getInitials(entry.nome)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{entry.nome}</span>
          <Badge variant="secondary" className="text-xs">
            Nv. {entry.nivel}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-yellow-500" />
            {entry.xp_total.toLocaleString()} XP
          </span>
          <span className="flex items-center gap-1">
            <Award className="h-3 w-3 text-purple-500" />
            {entry.conquistas} conquistas
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {getTendenciaIcon(entry.posicao, entry.posicao_anterior)}
      </div>
    </motion.div>
  );
};
