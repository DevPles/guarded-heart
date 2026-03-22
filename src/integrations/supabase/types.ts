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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      action_plans: {
        Row: {
          action: string
          assessment_id: string | null
          colaborador_id: string | null
          completed_at: string | null
          created_at: string
          due_date: string | null
          empresa_id: string
          evidence: string | null
          id: string
          origin: string
          priority: string | null
          responsible: string | null
          setor_id: string | null
          status: Database["public"]["Enums"]["action_plan_status"]
          updated_at: string
        }
        Insert: {
          action: string
          assessment_id?: string | null
          colaborador_id?: string | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          empresa_id: string
          evidence?: string | null
          id?: string
          origin?: string
          priority?: string | null
          responsible?: string | null
          setor_id?: string | null
          status?: Database["public"]["Enums"]["action_plan_status"]
          updated_at?: string
        }
        Update: {
          action?: string
          assessment_id?: string | null
          colaborador_id?: string | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          empresa_id?: string
          evidence?: string | null
          id?: string
          origin?: string
          priority?: string | null
          responsible?: string | null
          setor_id?: string | null
          status?: Database["public"]["Enums"]["action_plan_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_plans_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plans_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plans_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plans_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_items: {
        Row: {
          assessment_id: string
          comment: string | null
          created_at: string
          domain: string
          id: string
          na_flag: boolean | null
          question_number: number
          question_text: string
          value: number | null
          weight: number | null
        }
        Insert: {
          assessment_id: string
          comment?: string | null
          created_at?: string
          domain: string
          id?: string
          na_flag?: boolean | null
          question_number: number
          question_text: string
          value?: number | null
          weight?: number | null
        }
        Update: {
          assessment_id?: string
          comment?: string | null
          created_at?: string
          domain?: string
          id?: string
          na_flag?: boolean | null
          question_number?: number
          question_text?: string
          value?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_items_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          cargo_id: string | null
          colaborador_id: string | null
          created_at: string
          description: string | null
          empresa_id: string
          evaluator_id: string | null
          finalized_at: string | null
          id: string
          needs_aet: boolean | null
          risk_classification:
            | Database["public"]["Enums"]["risk_classification"]
            | null
          score_total: number | null
          setor_id: string | null
          status: Database["public"]["Enums"]["assessment_status"]
          title: string
          type: Database["public"]["Enums"]["assessment_type"]
          unidade_id: string | null
          updated_at: string
          version: number | null
        }
        Insert: {
          cargo_id?: string | null
          colaborador_id?: string | null
          created_at?: string
          description?: string | null
          empresa_id: string
          evaluator_id?: string | null
          finalized_at?: string | null
          id?: string
          needs_aet?: boolean | null
          risk_classification?:
            | Database["public"]["Enums"]["risk_classification"]
            | null
          score_total?: number | null
          setor_id?: string | null
          status?: Database["public"]["Enums"]["assessment_status"]
          title?: string
          type: Database["public"]["Enums"]["assessment_type"]
          unidade_id?: string | null
          updated_at?: string
          version?: number | null
        }
        Update: {
          cargo_id?: string | null
          colaborador_id?: string | null
          created_at?: string
          description?: string | null
          empresa_id?: string
          evaluator_id?: string | null
          finalized_at?: string | null
          id?: string
          needs_aet?: boolean | null
          risk_classification?:
            | Database["public"]["Enums"]["risk_classification"]
            | null
          score_total?: number | null
          setor_id?: string | null
          status?: Database["public"]["Enums"]["assessment_status"]
          title?: string
          type?: Database["public"]["Enums"]["assessment_type"]
          unidade_id?: string | null
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_cargo_id_fkey"
            columns: ["cargo_id"]
            isOneToOne: false
            referencedRelation: "cargos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          assessment_id: string | null
          created_at: string
          file_hash: string | null
          file_name: string
          file_url: string
          id: string
          kind: string
          metadata: Json | null
          uploaded_by: string | null
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string
          file_hash?: string | null
          file_name: string
          file_url: string
          id?: string
          kind?: string
          metadata?: Json | null
          uploaded_by?: string | null
        }
        Update: {
          assessment_id?: string | null
          created_at?: string
          file_hash?: string | null
          file_name?: string
          file_url?: string
          id?: string
          kind?: string
          metadata?: Json | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachments_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          empresa_id: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          empresa_id?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          empresa_id?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      cargos: {
        Row: {
          ativo: boolean
          cbo: string | null
          created_at: string
          descricao: string | null
          empresa_id: string
          id: string
          nome: string
          setor_id: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cbo?: string | null
          created_at?: string
          descricao?: string | null
          empresa_id: string
          id?: string
          nome: string
          setor_id?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cbo?: string | null
          created_at?: string
          descricao?: string | null
          empresa_id?: string
          id?: string
          nome?: string
          setor_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cargos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cargos_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists: {
        Row: {
          colaborador_id: string
          confirmed_at: string | null
          created_at: string
          empresa_id: string
          id: string
          month: number
          observations: string | null
          responses: Json
          score: number | null
          year: number
        }
        Insert: {
          colaborador_id: string
          confirmed_at?: string | null
          created_at?: string
          empresa_id: string
          id?: string
          month: number
          observations?: string | null
          responses?: Json
          score?: number | null
          year: number
        }
        Update: {
          colaborador_id?: string
          confirmed_at?: string | null
          created_at?: string
          empresa_id?: string
          id?: string
          month?: number
          observations?: string | null
          responses?: Json
          score?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "checklists_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      colaboradores: {
        Row: {
          cargo_id: string | null
          cpf: string | null
          created_at: string
          data_admissao: string | null
          data_nascimento: string | null
          empresa_id: string
          gestor_responsavel: string | null
          id: string
          jornada: string | null
          matricula: string | null
          nome_completo: string
          setor_id: string | null
          sexo: string | null
          status: string
          turno: string | null
          unidade_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cargo_id?: string | null
          cpf?: string | null
          created_at?: string
          data_admissao?: string | null
          data_nascimento?: string | null
          empresa_id: string
          gestor_responsavel?: string | null
          id?: string
          jornada?: string | null
          matricula?: string | null
          nome_completo: string
          setor_id?: string | null
          sexo?: string | null
          status?: string
          turno?: string | null
          unidade_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cargo_id?: string | null
          cpf?: string | null
          created_at?: string
          data_admissao?: string | null
          data_nascimento?: string | null
          empresa_id?: string
          gestor_responsavel?: string | null
          id?: string
          jornada?: string | null
          matricula?: string | null
          nome_completo?: string
          setor_id?: string | null
          sexo?: string | null
          status?: string
          turno?: string | null
          unidade_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "colaboradores_cargo_id_fkey"
            columns: ["cargo_id"]
            isOneToOne: false
            referencedRelation: "cargos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaboradores_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaboradores_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaboradores_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      consultor_empresas: {
        Row: {
          ativo: boolean
          created_at: string
          empresa_id: string
          id: string
          nivel_atuacao: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          empresa_id: string
          id?: string
          nivel_atuacao?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          empresa_id?: string
          id?: string
          nivel_atuacao?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultor_empresas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string
          empresa_id: string
          id: string
          observacoes: string | null
          plano_id: string
          status: string
          updated_at: string
          valor_mensal: number | null
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          empresa_id: string
          id?: string
          observacoes?: string | null
          plano_id: string
          status?: string
          updated_at?: string
          valor_mensal?: number | null
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          empresa_id?: string
          id?: string
          observacoes?: string | null
          plano_id?: string
          status?: string
          updated_at?: string
          valor_mensal?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          ativa: boolean
          cnae: string | null
          cnpj: string | null
          created_at: string
          endereco_bairro: string | null
          endereco_cep: string | null
          endereco_cidade: string | null
          endereco_complemento: string | null
          endereco_logradouro: string | null
          endereco_numero: string | null
          endereco_uf: string | null
          grau_risco: number | null
          id: string
          nome_fantasia: string | null
          razao_social: string
          responsavel_email: string | null
          responsavel_nome: string | null
          responsavel_telefone: string | null
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          cnae?: string | null
          cnpj?: string | null
          created_at?: string
          endereco_bairro?: string | null
          endereco_cep?: string | null
          endereco_cidade?: string | null
          endereco_complemento?: string | null
          endereco_logradouro?: string | null
          endereco_numero?: string | null
          endereco_uf?: string | null
          grau_risco?: number | null
          id?: string
          nome_fantasia?: string | null
          razao_social: string
          responsavel_email?: string | null
          responsavel_nome?: string | null
          responsavel_telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          cnae?: string | null
          cnpj?: string | null
          created_at?: string
          endereco_bairro?: string | null
          endereco_cep?: string | null
          endereco_cidade?: string | null
          endereco_complemento?: string | null
          endereco_logradouro?: string | null
          endereco_numero?: string | null
          endereco_uf?: string | null
          grau_risco?: number | null
          id?: string
          nome_fantasia?: string | null
          razao_social?: string
          responsavel_email?: string | null
          responsavel_nome?: string | null
          responsavel_telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      planos: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          limite_avaliacoes: number
          limite_colaboradores: number
          limite_usuarios: number
          nome: string
          updated_at: string
          valor_mensal: number | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          limite_avaliacoes?: number
          limite_colaboradores?: number
          limite_usuarios?: number
          nome: string
          updated_at?: string
          valor_mensal?: number | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          limite_avaliacoes?: number
          limite_colaboradores?: number
          limite_usuarios?: number
          nome?: string
          updated_at?: string
          valor_mensal?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          empresa_id: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          empresa_id?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          empresa_id?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_events: {
        Row: {
          assessment_id: string
          classification:
            | Database["public"]["Enums"]["risk_classification"]
            | null
          created_at: string
          evidence_links: string[] | null
          hazard: string
          id: string
          probability: number
          recommendations: string | null
          risk_score: number | null
          severity: number
        }
        Insert: {
          assessment_id: string
          classification?:
            | Database["public"]["Enums"]["risk_classification"]
            | null
          created_at?: string
          evidence_links?: string[] | null
          hazard: string
          id?: string
          probability: number
          recommendations?: string | null
          risk_score?: number | null
          severity: number
        }
        Update: {
          assessment_id?: string
          classification?:
            | Database["public"]["Enums"]["risk_classification"]
            | null
          created_at?: string
          evidence_links?: string[] | null
          hazard?: string
          id?: string
          probability?: number
          recommendations?: string | null
          risk_score?: number | null
          severity?: number
        }
        Relationships: [
          {
            foreignKeyName: "risk_events_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      setores: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          empresa_id: string
          id: string
          nome: string
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          empresa_id: string
          id?: string
          nome: string
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          empresa_id?: string
          id?: string
          nome?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "setores_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "setores_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      unidades: {
        Row: {
          ativa: boolean
          created_at: string
          empresa_id: string
          endereco: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          created_at?: string
          empresa_id: string
          endereco?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          created_at?: string
          empresa_id?: string
          endereco?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "unidades_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
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
          role: Database["public"]["Enums"]["app_role"]
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
      get_user_empresa_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      action_plan_status: "pendente" | "em_andamento" | "concluido" | "vencido"
      app_role:
        | "admin_master"
        | "consultor"
        | "empresa_gestor"
        | "colaborador"
        | "empresa_admin"
      assessment_status:
        | "rascunho"
        | "em_andamento"
        | "finalizado"
        | "cancelado"
      assessment_type: "aep" | "aet" | "arp"
      risk_classification: "baixo" | "moderado" | "alto" | "critico"
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
      action_plan_status: ["pendente", "em_andamento", "concluido", "vencido"],
      app_role: [
        "admin_master",
        "consultor",
        "empresa_gestor",
        "colaborador",
        "empresa_admin",
      ],
      assessment_status: [
        "rascunho",
        "em_andamento",
        "finalizado",
        "cancelado",
      ],
      assessment_type: ["aep", "aet", "arp"],
      risk_classification: ["baixo", "moderado", "alto", "critico"],
    },
  },
} as const
