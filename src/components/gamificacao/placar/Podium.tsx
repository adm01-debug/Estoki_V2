import React from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown, Medal, Trophy } from "lucide-react";
import { RankingEntry } from "@/hooks/useRanking";
import { getPodiumColor, getInitials } from "./placarHelpers";

interface PodiumProps {
  top3: RankingEntry[];
}

export const Podium: React.FC<PodiumProps> = ({ top3 }) => {
  if (top3.length < 3) return null;

  return (
    <div className="flex items-end justify-center gap-4 py-6">
      {/* 2º lugar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center"
      >
        <Avatar className={`h-16 w-16 ${getPodiumColor(2)} mb-2`}>
          <AvatarFallback className="bg-transparent text-lg">
            {getInitials(top3[1].nome)}
          </AvatarFallback>
        </Avatar>
        <span className="max-w-20 truncate text-center text-sm font-medium">{top3[1].nome}</span>
        <span className="text-xs text-muted-foreground">
          {top3[1].xp_total.toLocaleString()} XP
        </span>
        <div className="mt-2 flex h-16 w-20 items-center justify-center rounded-t-lg bg-gradient-to-t from-gray-400 to-gray-300">
          <Medal className="h-8 w-8 text-white" />
        </div>
      </motion.div>

      {/* 1º lugar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center"
      >
        <div className="relative">
          <Crown className="absolute -top-6 left-1/2 h-8 w-8 -translate-x-1/2 text-yellow-500" />
          <Avatar className={`h-20 w-20 ${getPodiumColor(1)} mb-2`}>
            <AvatarFallback className="bg-transparent text-xl">
              {getInitials(top3[0].nome)}
            </AvatarFallback>
          </Avatar>
        </div>
        <span className="max-w-24 truncate text-center text-sm font-medium">{top3[0].nome}</span>
        <span className="text-xs text-muted-foreground">
          {top3[0].xp_total.toLocaleString()} XP
        </span>
        <div className="mt-2 flex h-24 w-24 items-center justify-center rounded-t-lg bg-gradient-to-t from-yellow-500 to-yellow-400">
          <Trophy className="h-10 w-10 text-white" />
        </div>
      </motion.div>

      {/* 3º lugar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center"
      >
        <Avatar className={`h-14 w-14 ${getPodiumColor(3)} mb-2`}>
          <AvatarFallback className="bg-transparent">{getInitials(top3[2].nome)}</AvatarFallback>
        </Avatar>
        <span className="max-w-20 truncate text-center text-sm font-medium">{top3[2].nome}</span>
        <span className="text-xs text-muted-foreground">
          {top3[2].xp_total.toLocaleString()} XP
        </span>
        <div className="mt-2 flex h-12 w-20 items-center justify-center rounded-t-lg bg-gradient-to-t from-amber-600 to-amber-500">
          <Medal className="h-6 w-6 text-white" />
        </div>
      </motion.div>
    </div>
  );
};
