import * as React from "react";
import { Play, CheckCircle, AlertTriangle } from "lucide-react";
import { StatusTriagem } from "./constants";

export const statusConfig: Record<StatusTriagem, { label: string; icon: React.ReactNode; className: string }> = {
  em_andamento: { label: "Em Andamento", icon: React.createElement(Play, { className: "h-3 w-3" }), className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  aprovado: { label: "Aprovado", icon: React.createElement(CheckCircle, { className: "h-3 w-3" }), className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  ressalva: { label: "Ressalva", icon: React.createElement(AlertTriangle, { className: "h-3 w-3" }), className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  reprovado: { label: "Reprovado", icon: React.createElement(AlertTriangle, { className: "h-3 w-3" }), className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
};

export const getStatus = (triagem: { resultado?: string | null; data_fim?: string | null }): StatusTriagem => {
  if (!triagem.data_fim) return 'em_andamento';
  if (triagem.resultado === 'aprovado') return 'aprovado';
  if (triagem.resultado === 'reprovado') return 'reprovado';
  if (triagem.resultado === 'ressalva') return 'ressalva';
  return 'aprovado';
};

export const formatDate = (dateString?: string | null) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
