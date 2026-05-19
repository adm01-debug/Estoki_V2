import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Truck, 
  Package,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import React from 'react';

export interface StatusConfigItem {
  label: string;
  variant: string;
  icon: React.ElementType;
  bg: string;
  color: string;
}

export const STATUS_CONFIG: Record<string, StatusConfigItem> = {
  pending: { label: 'Pendente', variant: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, bg: 'bg-yellow-50', color: 'text-yellow-600' },
  processing: { label: 'Processando', variant: 'bg-blue-100 text-blue-800 border-blue-200', icon: Loader2, bg: 'bg-blue-50', color: 'text-blue-600' },
  completed: { label: 'Concluido', variant: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-600' },
  cancelled: { label: 'Cancelado', variant: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle, bg: 'bg-gray-50', color: 'text-gray-600' },
  error: { label: 'Erro', variant: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle, bg: 'bg-red-50', color: 'text-red-600' },
  shipped: { label: 'Enviado', variant: 'bg-purple-500/10 text-purple-600 border-purple-200/50', icon: Truck, bg: 'bg-purple-50', color: 'text-purple-600' },
  delivered: { label: 'Entregue', variant: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50', icon: Package, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  picking: { label: 'Separando', variant: 'bg-orange-500/10 text-orange-600 border-orange-200/50', icon: Package, bg: 'bg-orange-50', color: 'text-orange-600' },
  packed: { label: 'Embalado', variant: 'bg-indigo-500/10 text-indigo-600 border-indigo-200/50', icon: Package, bg: 'bg-indigo-50', color: 'text-indigo-600' },
  livre: { label: 'Livre', variant: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50', icon: CheckCircle, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  ocupado: { label: 'Ocupada', variant: 'bg-blue-500/10 text-blue-600 border-blue-200/50', icon: Package, bg: 'bg-blue-50', color: 'text-blue-600' },
  bloqueado: { label: 'Bloqueada', variant: 'bg-red-500/10 text-red-600 border-red-200/50', icon: XCircle, bg: 'bg-red-50', color: 'text-red-600' },
  manutencao: { label: 'Manutenção', variant: 'bg-amber-500/10 text-amber-600 border-amber-200/50', icon: AlertCircle, bg: 'bg-amber-50', color: 'text-amber-600' },
  reservado: { label: 'Reservada', variant: 'bg-amber-500/10 text-amber-600 border-amber-200/50', icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600' },
};

export const QUALITY_STATUS_CONFIG = {
  aprovado: { label: 'Aprovado', icon: ShieldCheck, color: 'text-success', bg: 'bg-success/10' },
  reprovado: { label: 'Reprovado', icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
  ressalva: { label: 'Ressalva', icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
  pendente: { label: 'Pendente', icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted/10' },
};