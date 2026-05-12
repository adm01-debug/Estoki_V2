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
    PostgrestVersion: "14.5"
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
      aprovacoes_movimentacao: {
        Row: {
          aprovador_id: string | null
          created_at: string
          data_decisao: string | null
          data_solicitacao: string
          id: string
          lote_id: string | null
          motivo: string | null
          observacao_aprovador: string | null
          posicao_id: string | null
          produto_id: string | null
          quantidade: number
          solicitante_id: string
          status: string
          tipo: string
          updated_at: string
        }
        Insert: {
          aprovador_id?: string | null
          created_at?: string
          data_decisao?: string | null
          data_solicitacao?: string
          id?: string
          lote_id?: string | null
          motivo?: string | null
          observacao_aprovador?: string | null
          posicao_id?: string | null
          produto_id?: string | null
          quantidade?: number
          solicitante_id: string
          status?: string
          tipo?: string
          updated_at?: string
        }
        Update: {
          aprovador_id?: string | null
          created_at?: string
          data_decisao?: string | null
          data_solicitacao?: string
          id?: string
          lote_id?: string | null
          motivo?: string | null
          observacao_aprovador?: string | null
          posicao_id?: string | null
          produto_id?: string | null
          quantidade?: number
          solicitante_id?: string
          status?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aprovacoes_movimentacao_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aprovacoes_movimentacao_posicao_id_fkey"
            columns: ["posicao_id"]
            isOneToOne: false
            referencedRelation: "posicoes_estoque"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aprovacoes_movimentacao_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_label: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_nome: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_label?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_nome?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_label?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_nome?: string | null
        }
        Relationships: []
      }
      checkpoints_zona: {
        Row: {
          created_at: string
          id: string
          lote_id: string | null
          observacoes: string | null
          operador_id: string
          posicao_id: string | null
          produto_id: string | null
          quantidade: number
          tipo: string
          zona: string
        }
        Insert: {
          created_at?: string
          id?: string
          lote_id?: string | null
          observacoes?: string | null
          operador_id: string
          posicao_id?: string | null
          produto_id?: string | null
          quantidade?: number
          tipo?: string
          zona: string
        }
        Update: {
          created_at?: string
          id?: string
          lote_id?: string | null
          observacoes?: string | null
          operador_id?: string
          posicao_id?: string | null
          produto_id?: string | null
          quantidade?: number
          tipo?: string
          zona?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkpoints_zona_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkpoints_zona_posicao_id_fkey"
            columns: ["posicao_id"]
            isOneToOne: false
            referencedRelation: "posicoes_estoque"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkpoints_zona_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      comprovantes_entrega: {
        Row: {
          assinatura_url: string | null
          created_at: string
          data_entrega: string | null
          data_reagendamento: string | null
          foto_entrega_url: string | null
          id: string
          latitude: number | null
          longitude: number | null
          motivo_recusa: string | null
          observacoes: string | null
          recebedor_documento: string | null
          recebedor_nome: string | null
          romaneio_id: string
          romaneio_item_id: string | null
          status: Database["public"]["Enums"]["status_entrega"]
          updated_at: string
        }
        Insert: {
          assinatura_url?: string | null
          created_at?: string
          data_entrega?: string | null
          data_reagendamento?: string | null
          foto_entrega_url?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          motivo_recusa?: string | null
          observacoes?: string | null
          recebedor_documento?: string | null
          recebedor_nome?: string | null
          romaneio_id: string
          romaneio_item_id?: string | null
          status?: Database["public"]["Enums"]["status_entrega"]
          updated_at?: string
        }
        Update: {
          assinatura_url?: string | null
          created_at?: string
          data_entrega?: string | null
          data_reagendamento?: string | null
          foto_entrega_url?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          motivo_recusa?: string | null
          observacoes?: string | null
          recebedor_documento?: string | null
          recebedor_nome?: string | null
          romaneio_id?: string
          romaneio_item_id?: string | null
          status?: Database["public"]["Enums"]["status_entrega"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comprovantes_entrega_romaneio_id_fkey"
            columns: ["romaneio_id"]
            isOneToOne: false
            referencedRelation: "romaneios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comprovantes_entrega_romaneio_item_id_fkey"
            columns: ["romaneio_item_id"]
            isOneToOne: false
            referencedRelation: "romaneio_itens"
            referencedColumns: ["id"]
          },
        ]
      }
      conquistas_definicoes: {
        Row: {
          ativo: boolean
          categoria: string
          codigo: string
          created_at: string
          criterio: string
          descricao: string
          icone: string
          id: string
          meta: number | null
          nome: string
          pontos: number
          raridade: string
        }
        Insert: {
          ativo?: boolean
          categoria?: string
          codigo: string
          created_at?: string
          criterio: string
          descricao: string
          icone?: string
          id?: string
          meta?: number | null
          nome: string
          pontos?: number
          raridade?: string
        }
        Update: {
          ativo?: boolean
          categoria?: string
          codigo?: string
          created_at?: string
          criterio?: string
          descricao?: string
          icone?: string
          id?: string
          meta?: number | null
          nome?: string
          pontos?: number
          raridade?: string
        }
        Relationships: []
      }
      conquistas_usuarios: {
        Row: {
          conquista_id: string
          created_at: string
          data_desbloqueio: string | null
          desbloqueada: boolean
          id: string
          progresso: number
          updated_at: string
          user_id: string
        }
        Insert: {
          conquista_id: string
          created_at?: string
          data_desbloqueio?: string | null
          desbloqueada?: boolean
          id?: string
          progresso?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          conquista_id?: string
          created_at?: string
          data_desbloqueio?: string | null
          desbloqueada?: boolean
          id?: string
          progresso?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conquistas_usuarios_conquista_id_fkey"
            columns: ["conquista_id"]
            isOneToOne: false
            referencedRelation: "conquistas_definicoes"
            referencedColumns: ["id"]
          },
        ]
      }
      custodia_transferencias: {
        Row: {
          assinatura_destino: boolean
          assinatura_origem: boolean
          confirmado_em: string | null
          created_at: string
          id: string
          lote_id: string | null
          motivo: string | null
          observacoes: string | null
          operador_destino_id: string
          operador_origem_id: string
          produto_id: string | null
          quantidade: number
          status: string
          zona_destino: string
          zona_origem: string
        }
        Insert: {
          assinatura_destino?: boolean
          assinatura_origem?: boolean
          confirmado_em?: string | null
          created_at?: string
          id?: string
          lote_id?: string | null
          motivo?: string | null
          observacoes?: string | null
          operador_destino_id: string
          operador_origem_id: string
          produto_id?: string | null
          quantidade?: number
          status?: string
          zona_destino: string
          zona_origem: string
        }
        Update: {
          assinatura_destino?: boolean
          assinatura_origem?: boolean
          confirmado_em?: string | null
          created_at?: string
          id?: string
          lote_id?: string | null
          motivo?: string | null
          observacoes?: string | null
          operador_destino_id?: string
          operador_origem_id?: string
          produto_id?: string | null
          quantidade?: number
          status?: string
          zona_destino?: string
          zona_origem?: string
        }
        Relationships: [
          {
            foreignKeyName: "custodia_transferencias_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custodia_transferencias_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      desafios_diarios: {
        Row: {
          ativo: boolean
          created_at: string
          data_ativo: string
          descricao: string
          dificuldade: string
          id: string
          meta: number
          tipo: string
          titulo: string
          xp_recompensa: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          data_ativo: string
          descricao: string
          dificuldade?: string
          id?: string
          meta: number
          tipo: string
          titulo: string
          xp_recompensa?: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          data_ativo?: string
          descricao?: string
          dificuldade?: string
          id?: string
          meta?: number
          tipo?: string
          titulo?: string
          xp_recompensa?: number
        }
        Relationships: []
      }
      desafios_usuarios: {
        Row: {
          concluido: boolean
          created_at: string
          data_conclusao: string | null
          desafio_id: string
          id: string
          progresso: number
          updated_at: string
          user_id: string
          xp_coletado: boolean
        }
        Insert: {
          concluido?: boolean
          created_at?: string
          data_conclusao?: string | null
          desafio_id: string
          id?: string
          progresso?: number
          updated_at?: string
          user_id: string
          xp_coletado?: boolean
        }
        Update: {
          concluido?: boolean
          created_at?: string
          data_conclusao?: string | null
          desafio_id?: string
          id?: string
          progresso?: number
          updated_at?: string
          user_id?: string
          xp_coletado?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "desafios_usuarios_desafio_id_fkey"
            columns: ["desafio_id"]
            isOneToOne: false
            referencedRelation: "desafios_diarios"
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
          version: number
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
          version?: number
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
          version?: number
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
      eventos_picking: {
        Row: {
          correto: boolean | null
          created_at: string
          data_fim: string | null
          data_inicio: string
          id: string
          observacoes: string | null
          operador_id: string | null
          posicao_id: string | null
          produto_id: string | null
          quantidade_separada: number
          quantidade_solicitada: number
          tarefa_id: string | null
        }
        Insert: {
          correto?: boolean | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          id?: string
          observacoes?: string | null
          operador_id?: string | null
          posicao_id?: string | null
          produto_id?: string | null
          quantidade_separada: number
          quantidade_solicitada: number
          tarefa_id?: string | null
        }
        Update: {
          correto?: boolean | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          id?: string
          observacoes?: string | null
          operador_id?: string | null
          posicao_id?: string | null
          produto_id?: string | null
          quantidade_separada?: number
          quantidade_solicitada?: number
          tarefa_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_picking_operador_id_fkey"
            columns: ["operador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_picking_posicao_id_fkey"
            columns: ["posicao_id"]
            isOneToOne: false
            referencedRelation: "posicoes_estoque"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_picking_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_picking_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefas"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos_triagem: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string
          fotos: string[] | null
          id: string
          lote_id: string | null
          observacoes: string | null
          operador_id: string | null
          produto_id: string | null
          resultado: string | null
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          fotos?: string[] | null
          id?: string
          lote_id?: string | null
          observacoes?: string | null
          operador_id?: string | null
          produto_id?: string | null
          resultado?: string | null
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          fotos?: string[] | null
          id?: string
          lote_id?: string | null
          observacoes?: string | null
          operador_id?: string | null
          produto_id?: string | null
          resultado?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_triagem_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_triagem_operador_id_fkey"
            columns: ["operador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_triagem_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedor_scores: {
        Row: {
          created_at: string
          entregas_conformes: number
          entregas_divergentes: number
          fornecedor: string
          id: string
          lead_time_medio_dias: number | null
          score: number | null
          total_entregas: number
          ultima_entrega: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          entregas_conformes?: number
          entregas_divergentes?: number
          fornecedor: string
          id?: string
          lead_time_medio_dias?: number | null
          score?: number | null
          total_entregas?: number
          ultima_entrega?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          entregas_conformes?: number
          entregas_divergentes?: number
          fornecedor?: string
          id?: string
          lead_time_medio_dias?: number | null
          score?: number | null
          total_entregas?: number
          ultima_entrega?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      gamificacao_usuarios: {
        Row: {
          created_at: string
          id: string
          nivel: number
          updated_at: string
          user_id: string
          xp_proximo_nivel: number
          xp_total: number
        }
        Insert: {
          created_at?: string
          id?: string
          nivel?: number
          updated_at?: string
          user_id: string
          xp_proximo_nivel?: number
          xp_total?: number
        }
        Update: {
          created_at?: string
          id?: string
          nivel?: number
          updated_at?: string
          user_id?: string
          xp_proximo_nivel?: number
          xp_total?: number
        }
        Relationships: []
      }
      geo_whitelist: {
        Row: {
          country_code: string
          country_name: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
        }
        Insert: {
          country_code: string
          country_name: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
        }
        Update: {
          country_code?: string
          country_name?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
        }
        Relationships: []
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
          version: number
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
          version?: number
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
          version?: number
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
      ip_whitelist: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          expires_at: string | null
          id: string
          ip_address: unknown
          is_active: boolean
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          ip_address: unknown
          is_active?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempts: number
          created_at: string
          email: string
          id: string
          ip_address: unknown
          last_attempt_at: string
          locked_until: string | null
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          email: string
          id?: string
          ip_address?: unknown
          last_attempt_at?: string
          locked_until?: string | null
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          email?: string
          id?: string
          ip_address?: unknown
          last_attempt_at?: string
          locked_until?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      login_logs: {
        Row: {
          browser: string | null
          created_at: string | null
          device_id: string | null
          id: string
          ip_address: unknown
          is_new_device: boolean | null
          location: string | null
          login_at: string | null
          os: string | null
          success: boolean | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string | null
          device_id?: string | null
          id?: string
          ip_address?: unknown
          is_new_device?: boolean | null
          location?: string | null
          login_at?: string | null
          os?: string | null
          success?: boolean | null
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string | null
          device_id?: string | null
          id?: string
          ip_address?: unknown
          is_new_device?: boolean | null
          location?: string | null
          login_at?: string | null
          os?: string | null
          success?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "login_logs_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "user_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      lotes: {
        Row: {
          conferido_por: string | null
          created_at: string
          data_conferencia: string | null
          data_fabricacao: string | null
          data_recebimento: string
          data_validade: string | null
          fornecedor: string | null
          id: string
          nf_entrada: string | null
          numero_lote: string
          observacoes_conferencia: string | null
          pedido_compra: string | null
          previsao_chegada: string | null
          produto_id: string
          quantidade_atual: number
          quantidade_inicial: number
          quantidade_pedida: number | null
          status: Database["public"]["Enums"]["status_recebimento"]
          updated_at: string
          version: number
        }
        Insert: {
          conferido_por?: string | null
          created_at?: string
          data_conferencia?: string | null
          data_fabricacao?: string | null
          data_recebimento?: string
          data_validade?: string | null
          fornecedor?: string | null
          id?: string
          nf_entrada?: string | null
          numero_lote: string
          observacoes_conferencia?: string | null
          pedido_compra?: string | null
          previsao_chegada?: string | null
          produto_id: string
          quantidade_atual: number
          quantidade_inicial: number
          quantidade_pedida?: number | null
          status?: Database["public"]["Enums"]["status_recebimento"]
          updated_at?: string
          version?: number
        }
        Update: {
          conferido_por?: string | null
          created_at?: string
          data_conferencia?: string | null
          data_fabricacao?: string | null
          data_recebimento?: string
          data_validade?: string | null
          fornecedor?: string | null
          id?: string
          nf_entrada?: string | null
          numero_lote?: string
          observacoes_conferencia?: string | null
          pedido_compra?: string | null
          previsao_chegada?: string | null
          produto_id?: string
          quantidade_atual?: number
          quantidade_inicial?: number
          quantidade_pedida?: number | null
          status?: Database["public"]["Enums"]["status_recebimento"]
          updated_at?: string
          version?: number
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
      metas_kpi: {
        Row: {
          ativo: boolean | null
          created_at: string
          descricao: string | null
          id: string
          metrica: string
          nome: string
          tipo: string
          unidade: string | null
          updated_at: string
          valor_meta: number
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          descricao?: string | null
          id?: string
          metrica: string
          nome: string
          tipo: string
          unidade?: string | null
          updated_at?: string
          valor_meta: number
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          descricao?: string | null
          id?: string
          metrica?: string
          nome?: string
          tipo?: string
          unidade?: string | null
          updated_at?: string
          valor_meta?: number
        }
        Relationships: []
      }
      metricas_dashboard: {
        Row: {
          created_at: string | null
          data: string
          id: string
          tipo: string
          updated_at: string | null
          valor: number
        }
        Insert: {
          created_at?: string | null
          data?: string
          id?: string
          tipo: string
          updated_at?: string | null
          valor?: number
        }
        Update: {
          created_at?: string | null
          data?: string
          id?: string
          tipo?: string
          updated_at?: string | null
          valor?: number
        }
        Relationships: []
      }
      metricas_operacionais: {
        Row: {
          acuracidade_picking: number | null
          created_at: string
          data: string
          erros_picking: number | null
          id: string
          itens_aprovados: number | null
          itens_reprovados: number | null
          itens_separados: number | null
          itens_triados: number | null
          movimentacoes_realizadas: number | null
          nfs_processadas: number | null
          pedidos_separados: number | null
          posicoes_ocupadas: number | null
          posicoes_totais: number | null
          taxa_aprovacao: number | null
          taxa_ocupacao: number | null
          tempo_medio_recebimento_minutos: number | null
          tempo_medio_triagem_minutos: number | null
          tempo_total_picking_minutos: number | null
          tempo_total_triagem_minutos: number | null
          updated_at: string
          volumes_recebidos: number | null
        }
        Insert: {
          acuracidade_picking?: number | null
          created_at?: string
          data?: string
          erros_picking?: number | null
          id?: string
          itens_aprovados?: number | null
          itens_reprovados?: number | null
          itens_separados?: number | null
          itens_triados?: number | null
          movimentacoes_realizadas?: number | null
          nfs_processadas?: number | null
          pedidos_separados?: number | null
          posicoes_ocupadas?: number | null
          posicoes_totais?: number | null
          taxa_aprovacao?: number | null
          taxa_ocupacao?: number | null
          tempo_medio_recebimento_minutos?: number | null
          tempo_medio_triagem_minutos?: number | null
          tempo_total_picking_minutos?: number | null
          tempo_total_triagem_minutos?: number | null
          updated_at?: string
          volumes_recebidos?: number | null
        }
        Update: {
          acuracidade_picking?: number | null
          created_at?: string
          data?: string
          erros_picking?: number | null
          id?: string
          itens_aprovados?: number | null
          itens_reprovados?: number | null
          itens_separados?: number | null
          itens_triados?: number | null
          movimentacoes_realizadas?: number | null
          nfs_processadas?: number | null
          pedidos_separados?: number | null
          posicoes_ocupadas?: number | null
          posicoes_totais?: number | null
          taxa_aprovacao?: number | null
          taxa_ocupacao?: number | null
          tempo_medio_recebimento_minutos?: number | null
          tempo_medio_triagem_minutos?: number | null
          tempo_total_picking_minutos?: number | null
          tempo_total_triagem_minutos?: number | null
          updated_at?: string
          volumes_recebidos?: number | null
        }
        Relationships: []
      }
      nfe_documents: {
        Row: {
          access_key: string
          created_at: string
          emitter_cnpj: string | null
          emitter_name: string | null
          id: string
          imported_at: string | null
          issue_date: string | null
          number: number | null
          operation_type: string | null
          series: number | null
          status: string | null
          total_nfe: number | null
          total_products: number | null
          updated_at: string
          xml_content: string | null
        }
        Insert: {
          access_key: string
          created_at?: string
          emitter_cnpj?: string | null
          emitter_name?: string | null
          id?: string
          imported_at?: string | null
          issue_date?: string | null
          number?: number | null
          operation_type?: string | null
          series?: number | null
          status?: string | null
          total_nfe?: number | null
          total_products?: number | null
          updated_at?: string
          xml_content?: string | null
        }
        Update: {
          access_key?: string
          created_at?: string
          emitter_cnpj?: string | null
          emitter_name?: string | null
          id?: string
          imported_at?: string | null
          issue_date?: string | null
          number?: number | null
          operation_type?: string | null
          series?: number | null
          status?: string | null
          total_nfe?: number | null
          total_products?: number | null
          updated_at?: string
          xml_content?: string | null
        }
        Relationships: []
      }
      nfe_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          nfe_id: string | null
          product_code: string | null
          quantity: number | null
          total: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          nfe_id?: string | null
          product_code?: string | null
          quantity?: number | null
          total?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          nfe_id?: string | null
          product_code?: string | null
          quantity?: number | null
          total?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nfe_items_nfe_id_fkey"
            columns: ["nfe_id"]
            isOneToOne: false
            referencedRelation: "nfe_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          created_at: string
          data_leitura: string | null
          id: string
          lida: boolean
          mensagem: string
          referencia_id: string | null
          referencia_tipo: string | null
          tipo: string
          titulo: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          data_leitura?: string | null
          id?: string
          lida?: boolean
          mensagem: string
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo: string
          titulo: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          data_leitura?: string | null
          id?: string
          lida?: boolean
          mensagem?: string
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo?: string
          titulo?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ocorrencias_perda: {
        Row: {
          acao_corretiva: string | null
          codigo: string
          created_at: string
          data_encerramento: string | null
          data_investigacao: string | null
          id: string
          investigado_por: string | null
          lote_id: string | null
          parecer: string | null
          produto_id: string | null
          quantidade: number
          reportado_por: string
          status: string
          tipo: string
          ultima_custodia_id: string | null
          ultimo_checkpoint_id: string | null
          ultimo_operador_id: string | null
          updated_at: string
          valor_prejuizo: number | null
          zona_detectada: string | null
        }
        Insert: {
          acao_corretiva?: string | null
          codigo: string
          created_at?: string
          data_encerramento?: string | null
          data_investigacao?: string | null
          id?: string
          investigado_por?: string | null
          lote_id?: string | null
          parecer?: string | null
          produto_id?: string | null
          quantidade?: number
          reportado_por: string
          status?: string
          tipo?: string
          ultima_custodia_id?: string | null
          ultimo_checkpoint_id?: string | null
          ultimo_operador_id?: string | null
          updated_at?: string
          valor_prejuizo?: number | null
          zona_detectada?: string | null
        }
        Update: {
          acao_corretiva?: string | null
          codigo?: string
          created_at?: string
          data_encerramento?: string | null
          data_investigacao?: string | null
          id?: string
          investigado_por?: string | null
          lote_id?: string | null
          parecer?: string | null
          produto_id?: string | null
          quantidade?: number
          reportado_por?: string
          status?: string
          tipo?: string
          ultima_custodia_id?: string | null
          ultimo_checkpoint_id?: string | null
          ultimo_operador_id?: string | null
          updated_at?: string
          valor_prejuizo?: number | null
          zona_detectada?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ocorrencias_perda_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocorrencias_perda_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocorrencias_perda_ultima_custodia_id_fkey"
            columns: ["ultima_custodia_id"]
            isOneToOne: false
            referencedRelation: "custodia_transferencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocorrencias_perda_ultimo_checkpoint_id_fkey"
            columns: ["ultimo_checkpoint_id"]
            isOneToOne: false
            referencedRelation: "checkpoints_zona"
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
          version: number
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
          version?: number
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
          version?: number
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
      passkey_credentials: {
        Row: {
          counter: number
          created_at: string
          credential_id: string
          device_name: string | null
          id: string
          last_used_at: string | null
          public_key: string
          transports: string[] | null
          user_id: string
        }
        Insert: {
          counter?: number
          created_at?: string
          credential_id: string
          device_name?: string | null
          id?: string
          last_used_at?: string | null
          public_key: string
          transports?: string[] | null
          user_id: string
        }
        Update: {
          counter?: number
          created_at?: string
          credential_id?: string
          device_name?: string | null
          id?: string
          last_used_at?: string | null
          public_key?: string
          transports?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      password_reset_requests: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          created_at: string
          expira_em: string
          id: string
          motivo: string | null
          observacao_admin: string | null
          solicitado_em: string
          status: string
          updated_at: string
          user_email: string
          user_id: string
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          created_at?: string
          expira_em?: string
          id?: string
          motivo?: string | null
          observacao_admin?: string | null
          solicitado_em?: string
          status?: string
          updated_at?: string
          user_email: string
          user_id: string
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          created_at?: string
          expira_em?: string
          id?: string
          motivo?: string | null
          observacao_admin?: string | null
          solicitado_em?: string
          status?: string
          updated_at?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          category: string
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
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
          avatar_url: string | null
          created_at: string
          departamento: string | null
          email: string | null
          id: string
          nome: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          departamento?: string | null
          email?: string | null
          id: string
          nome?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          departamento?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      query_telemetry: {
        Row: {
          count_mode: string | null
          created_at: string
          duration_ms: number
          error_message: string | null
          id: string
          operation: string
          query_limit: number | null
          query_offset: number | null
          record_count: number | null
          rpc_name: string | null
          severity: string
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          count_mode?: string | null
          created_at?: string
          duration_ms?: number
          error_message?: string | null
          id?: string
          operation?: string
          query_limit?: number | null
          query_offset?: number | null
          record_count?: number | null
          rpc_name?: string | null
          severity?: string
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          count_mode?: string | null
          created_at?: string
          duration_ms?: number
          error_message?: string | null
          id?: string
          operation?: string
          query_limit?: number | null
          query_offset?: number | null
          record_count?: number | null
          rpc_name?: string | null
          severity?: string
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      rastreamento_historico: {
        Row: {
          created_at: string
          data_evento: string
          descricao: string
          detalhes: Json | null
          documento_referencia: string | null
          id: string
          localizacao: string | null
          lote_id: string | null
          operador_id: string | null
          posicao_id: string | null
          produto_id: string | null
          quantidade: number | null
          tipo_evento: Database["public"]["Enums"]["tipo_evento_rastreamento"]
        }
        Insert: {
          created_at?: string
          data_evento?: string
          descricao: string
          detalhes?: Json | null
          documento_referencia?: string | null
          id?: string
          localizacao?: string | null
          lote_id?: string | null
          operador_id?: string | null
          posicao_id?: string | null
          produto_id?: string | null
          quantidade?: number | null
          tipo_evento: Database["public"]["Enums"]["tipo_evento_rastreamento"]
        }
        Update: {
          created_at?: string
          data_evento?: string
          descricao?: string
          detalhes?: Json | null
          documento_referencia?: string | null
          id?: string
          localizacao?: string | null
          lote_id?: string | null
          operador_id?: string | null
          posicao_id?: string | null
          produto_id?: string | null
          quantidade?: number | null
          tipo_evento?: Database["public"]["Enums"]["tipo_evento_rastreamento"]
        }
        Relationships: [
          {
            foreignKeyName: "rastreamento_historico_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rastreamento_historico_operador_id_fkey"
            columns: ["operador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rastreamento_historico_posicao_id_fkey"
            columns: ["posicao_id"]
            isOneToOne: false
            referencedRelation: "posicoes_estoque"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rastreamento_historico_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
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
      relatorios_agendados: {
        Row: {
          ativo: boolean
          created_at: string
          criado_por: string | null
          destinatarios: string[]
          frequencia: string
          id: string
          nome: string
          proximo_envio: string | null
          tipo: string
          ultimo_envio: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          criado_por?: string | null
          destinatarios?: string[]
          frequencia?: string
          id?: string
          nome: string
          proximo_envio?: string | null
          tipo: string
          ultimo_envio?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          criado_por?: string | null
          destinatarios?: string[]
          frequencia?: string
          id?: string
          nome?: string
          proximo_envio?: string | null
          tipo?: string
          ultimo_envio?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          granted: boolean
          granted_at: string
          granted_by: string | null
          id: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          granted?: boolean
          granted_at?: string
          granted_by?: string | null
          id?: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          granted?: boolean
          granted_at?: string
          granted_by?: string | null
          id?: string
          permission_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      romaneio_itens: {
        Row: {
          cliente: string
          contato_cliente: string | null
          created_at: string
          endereco_entrega: string
          id: string
          lote_id: string | null
          nf_saida: string | null
          observacoes: string | null
          ordem_entrega: number | null
          pedido_referencia: string | null
          peso_kg: number | null
          produto_id: string | null
          quantidade: number
          romaneio_id: string
          telefone_cliente: string | null
        }
        Insert: {
          cliente: string
          contato_cliente?: string | null
          created_at?: string
          endereco_entrega: string
          id?: string
          lote_id?: string | null
          nf_saida?: string | null
          observacoes?: string | null
          ordem_entrega?: number | null
          pedido_referencia?: string | null
          peso_kg?: number | null
          produto_id?: string | null
          quantidade?: number
          romaneio_id: string
          telefone_cliente?: string | null
        }
        Update: {
          cliente?: string
          contato_cliente?: string | null
          created_at?: string
          endereco_entrega?: string
          id?: string
          lote_id?: string | null
          nf_saida?: string | null
          observacoes?: string | null
          ordem_entrega?: number | null
          pedido_referencia?: string | null
          peso_kg?: number | null
          produto_id?: string | null
          quantidade?: number
          romaneio_id?: string
          telefone_cliente?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "romaneio_itens_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "romaneio_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "romaneio_itens_romaneio_id_fkey"
            columns: ["romaneio_id"]
            isOneToOne: false
            referencedRelation: "romaneios"
            referencedColumns: ["id"]
          },
        ]
      }
      romaneios: {
        Row: {
          codigo: string
          created_at: string
          data_criacao: string
          data_prevista_entrega: string | null
          data_retorno: string | null
          data_saida: string | null
          entregas_realizadas: number | null
          id: string
          motorista: string | null
          observacoes: string | null
          placa_veiculo: string | null
          responsavel_id: string | null
          rota: string | null
          status: Database["public"]["Enums"]["status_romaneio"]
          tipo_veiculo: string | null
          total_entregas: number | null
          total_peso_kg: number | null
          total_volumes: number | null
          updated_at: string
          version: number
        }
        Insert: {
          codigo: string
          created_at?: string
          data_criacao?: string
          data_prevista_entrega?: string | null
          data_retorno?: string | null
          data_saida?: string | null
          entregas_realizadas?: number | null
          id?: string
          motorista?: string | null
          observacoes?: string | null
          placa_veiculo?: string | null
          responsavel_id?: string | null
          rota?: string | null
          status?: Database["public"]["Enums"]["status_romaneio"]
          tipo_veiculo?: string | null
          total_entregas?: number | null
          total_peso_kg?: number | null
          total_volumes?: number | null
          updated_at?: string
          version?: number
        }
        Update: {
          codigo?: string
          created_at?: string
          data_criacao?: string
          data_prevista_entrega?: string | null
          data_retorno?: string | null
          data_saida?: string | null
          entregas_realizadas?: number | null
          id?: string
          motorista?: string | null
          observacoes?: string | null
          placa_veiculo?: string | null
          responsavel_id?: string | null
          rota?: string | null
          status?: Database["public"]["Enums"]["status_romaneio"]
          tipo_veiculo?: string | null
          total_entregas?: number | null
          total_peso_kg?: number | null
          total_volumes?: number | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "romaneios_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_filters: {
        Row: {
          created_at: string
          filtros: Json
          id: string
          modulo: string
          nome: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filtros?: Json
          id?: string
          modulo: string
          nome: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filtros?: Json
          id?: string
          modulo?: string
          nome?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      streaks_historico: {
        Row: {
          created_at: string
          data: string
          id: string
          user_id: string
          xp_ganho: number
        }
        Insert: {
          created_at?: string
          data: string
          id?: string
          user_id: string
          xp_ganho?: number
        }
        Update: {
          created_at?: string
          data?: string
          id?: string
          user_id?: string
          xp_ganho?: number
        }
        Relationships: []
      }
      streaks_usuarios: {
        Row: {
          created_at: string
          id: string
          streak_atual: number
          streak_recorde: number
          ultimo_checkin: string | null
          updated_at: string
          user_id: string
          xp_bonus_coletado: number
        }
        Insert: {
          created_at?: string
          id?: string
          streak_atual?: number
          streak_recorde?: number
          ultimo_checkin?: string | null
          updated_at?: string
          user_id: string
          xp_bonus_coletado?: number
        }
        Update: {
          created_at?: string
          id?: string
          streak_atual?: number
          streak_recorde?: number
          ultimo_checkin?: string | null
          updated_at?: string
          user_id?: string
          xp_bonus_coletado?: number
        }
        Relationships: []
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
          version: number
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
          version?: number
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
          version?: number
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
      trocas_devolucoes: {
        Row: {
          aberto_por: string | null
          analisado_por: string | null
          cliente: string
          created_at: string
          credito_gerado: boolean | null
          data_abertura: string
          data_analise: string | null
          data_resolucao: string | null
          descricao_problema: string | null
          fornecedor: string | null
          fotos: string[] | null
          id: string
          motivo: Database["public"]["Enums"]["motivo_td"]
          pedido: string
          produto: string
          quantidade: number
          resolucao: string | null
          sku: string | null
          status: Database["public"]["Enums"]["status_registro_td"]
          tipo: Database["public"]["Enums"]["tipo_registro_td"]
          updated_at: string
          valor_credito: number | null
          valor_total: number | null
          valor_unitario: number | null
        }
        Insert: {
          aberto_por?: string | null
          analisado_por?: string | null
          cliente: string
          created_at?: string
          credito_gerado?: boolean | null
          data_abertura?: string
          data_analise?: string | null
          data_resolucao?: string | null
          descricao_problema?: string | null
          fornecedor?: string | null
          fotos?: string[] | null
          id?: string
          motivo: Database["public"]["Enums"]["motivo_td"]
          pedido: string
          produto: string
          quantidade?: number
          resolucao?: string | null
          sku?: string | null
          status?: Database["public"]["Enums"]["status_registro_td"]
          tipo: Database["public"]["Enums"]["tipo_registro_td"]
          updated_at?: string
          valor_credito?: number | null
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Update: {
          aberto_por?: string | null
          analisado_por?: string | null
          cliente?: string
          created_at?: string
          credito_gerado?: boolean | null
          data_abertura?: string
          data_analise?: string | null
          data_resolucao?: string | null
          descricao_problema?: string | null
          fornecedor?: string | null
          fotos?: string[] | null
          id?: string
          motivo?: Database["public"]["Enums"]["motivo_td"]
          pedido?: string
          produto?: string
          quantidade?: number
          resolucao?: string | null
          sku?: string | null
          status?: Database["public"]["Enums"]["status_registro_td"]
          tipo?: Database["public"]["Enums"]["tipo_registro_td"]
          updated_at?: string
          valor_credito?: number | null
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Relationships: []
      }
      user_devices: {
        Row: {
          browser: string | null
          created_at: string | null
          device_fingerprint: string
          first_seen_at: string | null
          id: string
          ip_address: unknown
          is_trusted: boolean | null
          last_seen_at: string | null
          location: string | null
          os: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string | null
          device_fingerprint: string
          first_seen_at?: string | null
          id?: string
          ip_address?: unknown
          is_trusted?: boolean | null
          last_seen_at?: string | null
          location?: string | null
          os?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string | null
          device_fingerprint?: string
          first_seen_at?: string | null
          id?: string
          ip_address?: unknown
          is_trusted?: boolean | null
          last_seen_at?: string | null
          location?: string | null
          os?: string | null
          user_id?: string
        }
        Relationships: []
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
      webauthn_challenges: {
        Row: {
          challenge: string
          created_at: string
          expires_at: string
          id: string
          type: string
          user_id: string | null
        }
        Insert: {
          challenge: string
          created_at?: string
          expires_at?: string
          id?: string
          type: string
          user_id?: string | null
        }
        Update: {
          challenge?: string
          created_at?: string
          expires_at?: string
          id?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      xp_historico: {
        Row: {
          created_at: string
          descricao: string
          id: string
          quantidade: number
          referencia_id: string | null
          tipo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          quantidade: number
          referencia_id?: string | null
          tipo: string
          user_id: string
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          quantidade?: number
          referencia_id?: string | null
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adicionar_xp: {
        Args: {
          p_descricao: string
          p_quantidade: number
          p_referencia_id?: string
          p_tipo: string
          p_user_id: string
        }
        Returns: {
          created_at: string
          id: string
          nivel: number
          updated_at: string
          user_id: string
          xp_proximo_nivel: number
          xp_total: number
        }
        SetofOptions: {
          from: "*"
          to: "gamificacao_usuarios"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      calculate_lockout_duration: {
        Args: { attempt_count: number }
        Returns: string
      }
      check_login_lockout: {
        Args: { p_email: string }
        Returns: {
          attempts_count: number
          is_locked: boolean
          locked_until: string
          seconds_remaining: number
        }[]
      }
      collect_challenge_reward: {
        Args: { p_desafio_id: string }
        Returns: Json
      }
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
      incrementar_metrica_dashboard: {
        Args: { p_tipo: string; p_valor?: number }
        Returns: undefined
      }
      record_failed_login: {
        Args: { p_email: string; p_ip_address?: unknown }
        Returns: {
          attempts_count: number
          is_locked: boolean
          locked_until: string
          seconds_remaining: number
        }[]
      }
      registrar_checkin_diario: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string
          id: string
          streak_atual: number
          streak_recorde: number
          ultimo_checkin: string | null
          updated_at: string
          user_id: string
          xp_bonus_coletado: number
        }
        SetofOptions: {
          from: "*"
          to: "streaks_usuarios"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      reset_login_attempts: { Args: { p_email: string }; Returns: undefined }
    }
    Enums: {
      app_role: "operador" | "supervisor" | "admin"
      motivo_td:
        | "defeito"
        | "cor_errada"
        | "tamanho_errado"
        | "quantidade_errada"
        | "produto_errado"
        | "avaria_transporte"
        | "desistencia"
        | "outro"
      prioridade_tarefa: "baixa" | "media" | "alta" | "urgente"
      severidade_alerta: "info" | "aviso" | "critico" | "urgente"
      status_alerta: "ativo" | "reconhecido" | "resolvido" | "ignorado"
      status_ciclo_inventario:
        | "agendado"
        | "em_andamento"
        | "concluido"
        | "cancelado"
      status_contagem: "pendente" | "em_andamento" | "concluido" | "divergencia"
      status_entrega:
        | "pendente"
        | "em_rota"
        | "entregue"
        | "recusado"
        | "parcial"
        | "reagendado"
      status_onda: "pendente" | "em_andamento" | "concluida" | "cancelada"
      status_posicao: "livre" | "ocupado" | "reservado" | "bloqueado"
      status_recebimento:
        | "aguardando"
        | "em_transito"
        | "recebido"
        | "em_conferencia"
        | "conferido"
        | "divergencia"
        | "cancelado"
      status_registro_td:
        | "aberto"
        | "em_analise"
        | "aprovado"
        | "recusado"
        | "em_transito"
        | "recebido"
        | "finalizado"
      status_romaneio:
        | "rascunho"
        | "confirmado"
        | "em_transito"
        | "entregue"
        | "parcial"
        | "cancelado"
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
      tipo_evento_rastreamento:
        | "recebimento_nf"
        | "conferencia"
        | "triagem_inicio"
        | "triagem_fim"
        | "armazenamento"
        | "reserva"
        | "separacao"
        | "conferencia_expedicao"
        | "carregamento"
        | "saida_transporte"
        | "entrega"
        | "devolucao"
        | "ajuste_estoque"
      tipo_posicao: "porta_palete" | "box"
      tipo_registro_td: "troca" | "devolucao"
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
      motivo_td: [
        "defeito",
        "cor_errada",
        "tamanho_errado",
        "quantidade_errada",
        "produto_errado",
        "avaria_transporte",
        "desistencia",
        "outro",
      ],
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
      status_entrega: [
        "pendente",
        "em_rota",
        "entregue",
        "recusado",
        "parcial",
        "reagendado",
      ],
      status_onda: ["pendente", "em_andamento", "concluida", "cancelada"],
      status_posicao: ["livre", "ocupado", "reservado", "bloqueado"],
      status_recebimento: [
        "aguardando",
        "em_transito",
        "recebido",
        "em_conferencia",
        "conferido",
        "divergencia",
        "cancelado",
      ],
      status_registro_td: [
        "aberto",
        "em_analise",
        "aprovado",
        "recusado",
        "em_transito",
        "recebido",
        "finalizado",
      ],
      status_romaneio: [
        "rascunho",
        "confirmado",
        "em_transito",
        "entregue",
        "parcial",
        "cancelado",
      ],
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
      tipo_evento_rastreamento: [
        "recebimento_nf",
        "conferencia",
        "triagem_inicio",
        "triagem_fim",
        "armazenamento",
        "reserva",
        "separacao",
        "conferencia_expedicao",
        "carregamento",
        "saida_transporte",
        "entrega",
        "devolucao",
        "ajuste_estoque",
      ],
      tipo_posicao: ["porta_palete", "box"],
      tipo_registro_td: ["troca", "devolucao"],
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
