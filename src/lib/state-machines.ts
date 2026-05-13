/**
 * State Machines — Explicit status transitions for WMS entities
 */

import type { Database } from '@/integrations/supabase/types';

// ── Type aliases ───────────────────────────────────────────
type StatusRecebimento = Database['public']['Enums']['status_recebimento'];
type StatusTarefa = Database['public']['Enums']['status_tarefa'];
type StatusOnda = Database['public']['Enums']['status_onda'];
type StatusEntrega = Database['public']['Enums']['status_entrega'];
type StatusCiclo = Database['public']['Enums']['status_ciclo_inventario'];
type StatusContagem = Database['public']['Enums']['status_contagem'];
type StatusAlerta = Database['public']['Enums']['status_alerta'];

// ── Transition maps ───────────────────────────────────────
const loteTransitions: Record<StatusRecebimento, readonly StatusRecebimento[]> = {
  aguardando: ['em_transito', 'cancelado'],
  em_transito: ['recebido', 'cancelado'],
  recebido: ['em_conferencia'],
  em_conferencia: ['conferido', 'divergencia'],
  conferido: [],
   divergencia: ['em_conferencia', 'conferido', 'cancelado', 'quarentena'],
   cancelado: [],
   quarentena: ['recebido', 'cancelado'],
 };

const tarefaTransitions: Record<StatusTarefa, readonly StatusTarefa[]> = {
  pendente: ['atribuida', 'bloqueada'],
  atribuida: ['em_andamento', 'pendente', 'bloqueada'],
   em_andamento: ['concluida', 'bloqueada', 'pendente', 'cancelada', 'atrasada'],
   concluida: [],
   bloqueada: ['pendente', 'atribuida', 'cancelada'],
   atrasada: ['pendente', 'em_andamento', 'cancelada'],
   cancelada: [],
 };

const ondaTransitions: Record<StatusOnda, readonly StatusOnda[]> = {
  pendente: ['em_andamento', 'cancelada'],
  em_andamento: ['concluida', 'cancelada'],
  concluida: [],
  cancelada: [],
};

const entregaTransitions: Record<StatusEntrega, readonly StatusEntrega[]> = {
  pendente: ['em_rota', 'reagendado'],
  em_rota: ['entregue', 'recusado', 'parcial', 'reagendado'],
  entregue: [],
  recusado: ['reagendado', 'pendente'],
  parcial: ['em_rota', 'entregue'],
  reagendado: ['pendente', 'em_rota'],
};

const cicloTransitions: Record<StatusCiclo, readonly StatusCiclo[]> = {
  agendado: ['em_andamento', 'cancelado'],
  em_andamento: ['concluido', 'cancelado'],
  concluido: [],
  cancelado: [],
};

const contagemTransitions: Record<StatusContagem, readonly StatusContagem[]> = {
  pendente: ['em_andamento'],
  em_andamento: ['concluido', 'divergencia'],
  concluido: [],
  divergencia: ['em_andamento', 'concluido'],
};

const alertaTransitions: Record<StatusAlerta, readonly StatusAlerta[]> = {
  ativo: ['reconhecido', 'resolvido', 'ignorado'],
  reconhecido: ['resolvido', 'ignorado'],
  resolvido: [],
  ignorado: [],
};

// ── Entity registry ────────────────────────────────────────
type EntityType = 'lote' | 'tarefa' | 'onda' | 'entrega' | 'ciclo' | 'contagem' | 'alerta';

type StatusOf<E extends EntityType> =
  E extends 'lote' ? StatusRecebimento :
  E extends 'tarefa' ? StatusTarefa :
  E extends 'onda' ? StatusOnda :
  E extends 'entrega' ? StatusEntrega :
  E extends 'ciclo' ? StatusCiclo :
  E extends 'contagem' ? StatusContagem :
  E extends 'alerta' ? StatusAlerta :
  never;

const transitionMaps: Record<EntityType, Record<string, readonly string[]>> = {
  lote: loteTransitions,
  tarefa: tarefaTransitions,
  onda: ondaTransitions,
  entrega: entregaTransitions,
  ciclo: cicloTransitions,
  contagem: contagemTransitions,
  alerta: alertaTransitions,
};

// ── Public API ─────────────────────────────────────────────
export function canTransition<E extends EntityType>(
  entity: E,
  from: StatusOf<E>,
  to: StatusOf<E>,
): boolean {
  const map = transitionMaps[entity];
  const allowed = map[from as string];
  if (!allowed) return false;
  return allowed.includes(to as string);
}

export function getNextStatuses<E extends EntityType>(
  entity: E,
  current: StatusOf<E>,
): readonly StatusOf<E>[] {
  const map = transitionMaps[entity];
  return (map[current as string] ?? []) as StatusOf<E>[];
}

export function isTerminal<E extends EntityType>(
  entity: E,
  status: StatusOf<E>,
): boolean {
  return getNextStatuses(entity, status).length === 0;
}

export function assertTransition<E extends EntityType>(
  entity: E,
  from: StatusOf<E>,
  to: StatusOf<E>,
): void {
  if (!canTransition(entity, from, to)) {
    const allowed = getNextStatuses(entity, from);
    throw new Error(
      `Invalid ${entity} transition: "${String(from)}" → "${String(to)}". ` +
      `Allowed: [${allowed.map(String).join(', ')}]`,
    );
  }
}

export type { EntityType, StatusOf };
