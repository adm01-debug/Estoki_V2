export interface Usuario {
  id: string;
  email: string;
  nome: string;
  cargo: string;
  setor: string;
  avatar_url?: string;
  ativo: boolean;
  permissoes: string[];
  created_at: string;
}

export type UsuarioRole = "admin" | "supervisor" | "operador" | "visualizador";

export interface UsuarioStats {
  triagens_realizadas: number;
  xp_total: number;
  nivel: number;
  streak_atual: number;
}
