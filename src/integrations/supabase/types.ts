export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alertas_config: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          notificar_email: boolean | null
          notificar_push: boolean | null
          severidade: Database["public"]["Enums"]["severidade_alerta"]
          threshold_dias: number | null
          threshold_valor: number | null
          tipo: Database["public"]["Enums"]["tipo_alerta"]
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          notificar_email?: boolean | null
          notificar_push?: boolean | null
          severidade?: Database["public"]["Enums"]["severidade_alerta"]
          threshold_dias?: number | null
          threshold_valor?: number | null
          tipo: Database["public"]["Enums"]["tipo_alerta"]
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          notificar_email?: boolean | null
          notificar_push?: boolean | null
          severidade?: Database["public"]["Enums"]["severidade_alerta"]
          threshold_dias?: number | null
          threshold_valor?: number | null
          tipo?: Database["public"]["Enums"]["tipo_alerta"]
          updated_at?: string
        }
        Relationships: []
      }
      alertas_historico: {
        Row: {
          created_at: string
          dados_contexto: Json | null
          data_reconhecimento: string | null
          data_resolucao: string | null
          id: string
          lote_id: string | null
          mensagem: string
          posicao_id: string | null
          produto_id: string | null
          reconhecido_por: string | null
          resolvido_por: string | null
          severidade: Database["public"]["Enums"]["severidade_alerta"]
          status: Database["public"]["Enums"]["status_alerta"]
          tipo: Database["public"]["Enums"]["tipo_alerta"]
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dados_contexto?: Json | null
          data_reconhecimento?: string | null
          data_resolucao?: string | null
          id?: string
          lote_id?: string | null
          mensagem: string
          posicao_id?: string | null
          produto_id?: string | null
          reconhecido_por?: string | null
          resolvido_por?: string | null
          severidade: Database["public"]["Enums"]["severidade_alerta"]
          status?: Database["public"]["Enums"]["status_alerta"]
          tipo: Database["public"]["Enums"]["tipo_alerta"]
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dados_contexto?: Json | null
          data_reconhecimento?: string | null
          data_resolucao?: string | null
          id?: string
          lote_id?: string | null
          mensagem?: string
          posicao_id?: string | null
          produto_id?: string | null
          reconhecido_por?: string | null
          resolvido_por?: string | null
          severidade?: Database["public"]["Enums"]["severidade_alerta"]
          status?: Database["public"]["Enums"]["status_alerta"]
          tipo?: Database["public"]["Enums"]["tipo_alerta"]
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alertas_historico_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_historico_posicao_id_fkey"
            columns: ["posicao_id"]
            isOneToOne: false
            referencedRelation: "posicoes_estoque"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_historico_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_historico_reconhecido_por_fkey"
            columns: ["reconhecido_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_historico_resolvido_por_fkey"
            columns: ["resolvido_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque_posicao: {
        Row: {
          created_at: string
          data_entrada: string
          id: string
          lote_id: string | null
          posicao_id: string
          produto_id: string
          quantidade: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_entrada?: string
          id?: string
          lote_id?: string | null
          posicao_id: string
          produto_id: string
          quantidade?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_entrada?: string
          id?: string
          lote_id?: string | null
          posicao_id?: string
          produto_id?: string
          quantidade?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estoque_posicao_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_posicao_posicao_id_fkey"
            columns: ["posicao_id"]
            isOneToOne: false
            referencedRelation: "posicoes_estoque"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_posicao_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      inventario_ciclos: {
        Row: {
          acuracidade: number | null
          created_at: string
          data_agendada: string
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          divergencias_encontradas: number | null
          id: string
          nome: string
          observacoes: string | null
          porta_palete_alvo: string | null
          posicoes_contadas: number | null
          responsavel_id: string | null
          status: Database["public"]["Enums"]["status_ciclo_inventario"]
          tipo: string
          total_posicoes: number | null
          updated_at: string
          zona_alvo: string | null
        }
        Insert: {
          acuracidade?: number | null
          created_at?: string
          data_agendada: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          divergencias_encontradas?: number | null
          id?: string
          nome: string
          observacoes?: string | null
          porta_palete_alvo?: string | null
          posicoes_contadas?: number | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["status_ciclo_inventario"]
          tipo?: string
          total_posicoes?: number | null
          updated_at?: string
          zona_alvo?: string | null
        }
        Update: {
          acuracidade?: number | null
          created_at?: string
          data_agendada?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          divergencias_encontradas?: number | null
          id?: string
          nome?: string
          observacoes?: string | null
          porta_palete_alvo?: string | null
          posicoes_contadas?: number | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["status_ciclo_inventario"]
          tipo?: string
          total_posicoes?: number | null
          updated_at?: string
          zona_alvo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventario_ciclos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventario_config: {
        Row: {
          alerta_posicao_ociosa_dias: number | null
          alerta_vencimento_dias: number | null
          frequencia_zona_a: number | null
          frequencia_zona_b: number | null
          frequencia_zona_c: number | null
          id: string
          meta_acuracidade: number
          threshold_divergencia: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          alerta_posicao_ociosa_dias?: number | null
          alerta_vencimento_dias?: number | null
          frequencia_zona_a?: number | null
          frequencia_zona_b?: number | null
          frequencia_zona_c?: number | null
          id?: string
          meta_acuracidade?: number
          threshold_divergencia?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          alerta_posicao_ociosa_dias?: number | null
          alerta_vencimento_dias?: number | null
          frequencia_zona_a?: number | null
          frequencia_zona_b?: number | null
          frequencia_zona_c?: number | null
          id?: string
          meta_acuracidade?: number
          threshold_divergencia?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventario_config_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventario_contagens: {
        Row: {
          ajustado_por: string | null
          ajuste_realizado: boolean | null
          ciclo_id: string
          contado_por: string | null
          created_at: string
          data_ajuste: string | null
          data_contagem: string | null
          data_recontagem: string | null
          id: string
          justificativa_ajuste: string | null
          lote_id: string | null
          observacoes: string | null
          posicao_id: string
          produto_id: string | null
          quantidade_contada: number | null
          quantidade_recontada: number | null
          quantidade_sistema: number
          recontado_por: string | null
          recontagem_necessaria: boolean | null
          status: Database["public"]["Enums"]["status_contagem"]
          updated_at: string
        }
        Insert: {
          ajustado_por?: string | null
          ajuste_realizado?: boolean | null
          ciclo_id: string
          contado_por?: string | null
          created_at?: string
          data_ajuste?: string | null
          data_contagem?: string | null
          data_recontagem?: string | null
          id?: string
          justificativa_ajuste?: string | null
          lote_id?: string | null
          observacoes?: string | null
          posicao_id: string
          produto_id?: string | null
          quantidade_contada?: number | null
          quantidade_recontada?: number | null
          quantidade_sistema?: number
          recontado_por?: string | null
          recontagem_necessaria?: boolean | null
          status?: Database["public"]["Enums"]["status_contagem"]
          updated_at?: string
        }
        Update: {
          ajustado_por?: string | null
          ajuste_realizado?: boolean | null
          ciclo_id?: string
          contado_por?: string | null
          created_at?: string
          data_ajuste?: string | null
          data_contagem?: string | null
          data_recontagem?: string | null
          id?: string
          justificativa_ajuste?: string | null
          lote_id?: string | null
          observacoes?: string | null
          posicao_id?: string
          produto_id?: string | null
          quantidade_contada?: number | null
          quantidade_recontada?: number | null
          quantidade_sistema?: number
          recontado_por?: string | null
          recontagem_necessaria?: boolean | null
          status?: Database["public"]["Enums"]["status_contagem"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventario_contagens_ajustado_por_fkey"
            columns: ["ajustado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_contagens_ciclo_id_fkey"
            columns: ["ciclo_id"]
            isOneToOne: false
            referencedRelation: "inventario_ciclos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_contagens_contado_por_fkey"
            columns: ["contado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_contagens_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_contagens_posicao_id_fkey"
            columns: ["posicao_id"]
            isOneToOne: false
            referencedRelation: "posicoes_estoque"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_contagens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_contagens_recontado_por_fkey"
            columns: ["recontado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lotes: {
        Row: {
          created_at: string
          data_fabricacao: string | null
          data_recebimento: string
          data_validade: string | null
          fornecedor: string | null
          id: string
          nf_entrada: string | null
          numero_lote: string
          produto_id: string
          quantidade_atual: number
          quantidade_inicial: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_fabricacao?: string | null
          data_recebimento?: string
          data_validade?: string | null
          fornecedor?: string | null
          id?: string
          nf_entrada?: string | null
          numero_lote: string
          produto_id: string
          quantidade_atual: number
          quantidade_inicial: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_fabricacao?: string | null
          data_recebimento?: string
          data_validade?: string | null
          fornecedor?: string | null
          id?: string
          nf_entrada?: string | null
          numero_lote?: string
          produto_id?: string
          quantidade_atual?: number
          quantidade_inicial?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lotes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      ondas_separacao: {
        Row: {
          codigo: string
          created_at: string
          data_conclusao: string | null
          data_criacao: string
          data_inicio: string | null
          descricao: string | null
          id: string
          prioridade: Database["public"]["Enums"]["prioridade_tarefa"]
          responsavel_id: string | null
          rota: string | null
          status: Database["public"]["Enums"]["status_onda"]
          tarefas_concluidas: number | null
          total_tarefas: number | null
          updated_at: string
          zona_alvo: string | null
        }
        Insert: {
          codigo: string
          created_at?: string
          data_conclusao?: string | null
          data_criacao?: string
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          prioridade?: Database["public"]["Enums"]["prioridade_tarefa"]
          responsavel_id?: string | null
          rota?: string | null
          status?: Database["public"]["Enums"]["status_onda"]
          tarefas_concluidas?: number | null
          total_tarefas?: number | null
          updated_at?: string
          zona_alvo?: string | null
        }
        Update: {
          codigo?: string
          created_at?: string
          data_conclusao?: string | null
          data_criacao?: string
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          prioridade?: Database["public"]["Enums"]["prioridade_tarefa"]
          responsavel_id?: string | null
          rota?: string | null
          status?: Database["public"]["Enums"]["status_onda"]
          tarefas_concluidas?: number | null
          total_tarefas?: number | null
          updated_at?: string
          zona_alvo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ondas_separacao_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posicoes_estoque: {
        Row: {
          box: string | null
          capacidade_kg: number | null
          codigo: string
          created_at: string
          id: string
          nivel: string | null
          porta_palete: string | null
          secao: string | null
          status: Database["public"]["Enums"]["status_posicao"]
          tipo: Database["public"]["Enums"]["tipo_posicao"]
          updated_at: string
          zona: string | null
        }
        Insert: {
          box?: string | null
          capacidade_kg?: number | null
          codigo: string
          created_at?: string
          id?: string
          nivel?: string | null
          porta_palete?: string | null
          secao?: string | null
          status?: Database["public"]["Enums"]["status_posicao"]
          tipo: Database["public"]["Enums"]["tipo_posicao"]
          updated_at?: string
          zona?: string | null
        }
        Update: {
          box?: string | null
          capacidade_kg?: number | null
          codigo?: string
          created_at?: string
          id?: string
          nivel?: string | null
          porta_palete?: string | null
          secao?: string | null
          status?: Database["public"]["Enums"]["status_posicao"]
          tipo?: Database["public"]["Enums"]["tipo_posicao"]
          updated_at?: string
          zona?: string | null
        }
        Relationships: []
      }
      produtividade_operador: {
        Row: {
          created_at: string
          data: string
          id: string
          itens_movimentados: number | null
          operador_id: string
          tarefas_atribuidas: number | null
          tarefas_concluidas: number | null
          taxa_acerto: number | null
          tempo_total_minutos: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: string
          id?: string
          itens_movimentados?: number | null
          operador_id: string
          tarefas_atribuidas?: number | null
          tarefas_concluidas?: number | null
          taxa_acerto?: number | null
          tempo_total_minutos?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: string
          id?: string
          itens_movimentados?: number | null
          operador_id?: string
          tarefas_atribuidas?: number | null
          tarefas_concluidas?: number | null
          taxa_acerto?: number | null
          tempo_total_minutos?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtividade_operador_operador_id_fkey"
            columns: ["operador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          created_at: string
          curva_abc: string | null
          descricao: string | null
          estoque_maximo: number | null
          estoque_minimo: number | null
          fornecedor_principal: string | null
          giro_mensal: number | null
          id: string
          nome: string
          peso_unitario: number | null
          ponto_pedido: number | null
          sku: string
          unidade: string | null
          updated_at: string
          volume_unitario: number | null
        }
        Insert: {
          created_at?: string
          curva_abc?: string | null
          descricao?: string | null
          estoque_maximo?: number | null
          estoque_minimo?: number | null
          fornecedor_principal?: string | null
          giro_mensal?: number | null
          id?: string
          nome: string
          peso_unitario?: number | null
          ponto_pedido?: number | null
          sku: string
          unidade?: string | null
          updated_at?: string
          volume_unitario?: number | null
        }
        Update: {
          created_at?: string
          curva_abc?: string | null
          descricao?: string | null
          estoque_maximo?: number | null
          estoque_minimo?: number | null
          fornecedor_principal?: string | null
          giro_mensal?: number | null
          id?: string
          nome?: string
          peso_unitario?: number | null
          ponto_pedido?: number | null
          sku?: string
          unidade?: string | null
          updated_at?: string
          volume_unitario?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          nome?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      regras_ponto_pedido: {
        Row: {
          ativo: boolean
          created_at: string
          estoque_maximo: number | null
          estoque_minimo: number
          fornecedor_preferencial: string | null
          id: string
          lead_time_dias: number | null
          ponto_pedido: number
          produto_id: string
          quantidade_pedido_sugerida: number | null
          ultimo_alerta_em: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          estoque_maximo?: number | null
          estoque_minimo?: number
          fornecedor_preferencial?: string | null
          id?: string
          lead_time_dias?: number | null
          ponto_pedido?: number
          produto_id: string
          quantidade_pedido_sugerida?: number | null
          ultimo_alerta_em?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          estoque_maximo?: number | null
          estoque_minimo?: number
          fornecedor_preferencial?: string | null
          id?: string
          lead_time_dias?: number | null
          ponto_pedido?: number
          produto_id?: string
          quantidade_pedido_sugerida?: number | null
          ultimo_alerta_em?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "regras_ponto_pedido_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: true
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefas: {
        Row: {
          created_at: string
          data_atribuicao: string | null
          data_conclusao: string | null
          data_inicio: string | null
          id: string
          instrucoes: string | null
          observacoes: string | null
          onda_id: string | null
          operador_id: string | null
          posicao_destino_id: string | null
          posicao_origem_id: string | null
          prioridade: Database["public"]["Enums"]["prioridade_tarefa"]
          produto_id: string | null
          quantidade: number
          quantidade_executada: number | null
          rota: string | null
          status: Database["public"]["Enums"]["status_tarefa"]
          tempo_estimado_minutos: number | null
          tempo_real_minutos: number | null
          tipo: Database["public"]["Enums"]["tipo_tarefa"]
          updated_at: string
          zona: string | null
        }
        Insert: {
          created_at?: string
          data_atribuicao?: string | null
          data_conclusao?: string | null
          data_inicio?: string | null
          id?: string
          instrucoes?: string | null
          observacoes?: string | null
          onda_id?: string | null
          operador_id?: string | null
          posicao_destino_id?: string | null
          posicao_origem_id?: string | null
          prioridade?: Database["public"]["Enums"]["prioridade_tarefa"]
          produto_id?: string | null
          quantidade?: number
          quantidade_executada?: number | null
          rota?: string | null
          status?: Database["public"]["Enums"]["status_tarefa"]
          tempo_estimado_minutos?: number | null
          tempo_real_minutos?: number | null
          tipo?: Database["public"]["Enums"]["tipo_tarefa"]
          updated_at?: string
          zona?: string | null
        }
        Update: {
          created_at?: string
          data_atribuicao?: string | null
          data_conclusao?: string | null
          data_inicio?: string | null
          id?: string
          instrucoes?: string | null
          observacoes?: string | null
          onda_id?: string | null
          operador_id?: string | null
          posicao_destino_id?: string | null
          posicao_origem_id?: string | null
          prioridade?: Database["public"]["Enums"]["prioridade_tarefa"]
          produto_id?: string | null
          quantidade?: number
          quantidade_executada?: number | null
          rota?: string | null
          status?: Database["public"]["Enums"]["status_tarefa"]
          tempo_estimado_minutos?: number | null
          tempo_real_minutos?: number | null
          tipo?: Database["public"]["Enums"]["tipo_tarefa"]
          updated_at?: string
          zona?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_onda_id_fkey"
            columns: ["onda_id"]
            isOneToOne: false
            referencedRelation: "ondas_separacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_operador_id_fkey"
            columns: ["operador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_posicao_destino_id_fkey"
            columns: ["posicao_destino_id"]
            isOneToOne: false
            referencedRelation: "posicoes_estoque"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_posicao_origem_id_fkey"
            columns: ["posicao_origem_id"]
            isOneToOne: false
            referencedRelation: "posicoes_estoque"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "operador" | "supervisor" | "admin"
      prioridade_tarefa: "baixa" | "media" | "alta" | "urgente"
      severidade_alerta: "info" | "aviso" | "critico" | "urgente"
      status_alerta: "ativo" | "reconhecido" | "resolvido" | "ignorado"
      status_ciclo_inventario:
        | "agendado"
        | "em_andamento"
        | "concluido"
        | "cancelado"
      status_contagem: "pendente" | "em_andamento" | "concluido" | "divergencia"
      status_onda: "pendente" | "em_andamento" | "concluida" | "cancelada"
      status_posicao: "livre" | "ocupado" | "reservado" | "bloqueado"
      status_tarefa:
        | "pendente"
        | "atribuida"
        | "em_andamento"
        | "concluida"
        | "bloqueada"
      tipo_alerta:
        | "estoque_minimo"
        | "estoque_maximo"
        | "ponto_pedido"
        | "posicao_ociosa"
        | "vencimento_proximo"
        | "gargalo_triagem"
        | "divergencia_inventario"
        | "item_sem_movimentacao"
      tipo_posicao: "porta_palete" | "box"
      tipo_tarefa:
        | "separacao"
        | "armazenagem"
        | "transferencia"
        | "inventario"
        | "expedicao"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["operador", "supervisor", "admin"],
      prioridade_tarefa: ["baixa", "media", "alta", "urgente"],
      severidade_alerta: ["info", "aviso", "critico", "urgente"],
      status_alerta: ["ativo", "reconhecido", "resolvido", "ignorado"],
      status_ciclo_inventario: [
        "agendado",
        "em_andamento",
        "concluido",
        "cancelado",
      ],
      status_contagem: ["pendente", "em_andamento", "concluido", "divergencia"],
      status_onda: ["pendente", "em_andamento", "concluida", "cancelada"],
      status_posicao: ["livre", "ocupado", "reservado", "bloqueado"],
      status_tarefa: [
        "pendente",
        "atribuida",
        "em_andamento",
        "concluida",
        "bloqueada",
      ],
      tipo_alerta: [
        "estoque_minimo",
        "estoque_maximo",
        "ponto_pedido",
        "posicao_ociosa",
        "vencimento_proximo",
        "gargalo_triagem",
        "divergencia_inventario",
        "item_sem_movimentacao",
      ],
      tipo_posicao: ["porta_palete", "box"],
      tipo_tarefa: [
        "separacao",
        "armazenagem",
        "transferencia",
        "inventario",
        "expedicao",
      ],
    },
  },
} as const
