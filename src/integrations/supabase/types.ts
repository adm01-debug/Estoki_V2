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
      status_ciclo_inventario:
        | "agendado"
        | "em_andamento"
        | "concluido"
        | "cancelado"
      status_contagem: "pendente" | "em_andamento" | "concluido" | "divergencia"
      status_posicao: "livre" | "ocupado" | "reservado" | "bloqueado"
      tipo_posicao: "porta_palete" | "box"
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
      status_ciclo_inventario: [
        "agendado",
        "em_andamento",
        "concluido",
        "cancelado",
      ],
      status_contagem: ["pendente", "em_andamento", "concluido", "divergencia"],
      status_posicao: ["livre", "ocupado", "reservado", "bloqueado"],
      tipo_posicao: ["porta_palete", "box"],
    },
  },
} as const
