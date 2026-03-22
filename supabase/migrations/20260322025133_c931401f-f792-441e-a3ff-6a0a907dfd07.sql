
-- =============================================
-- PCMSO (NR-07) Tables
-- =============================================

-- PCMSO Programs (annual cycle per company)
CREATE TABLE public.pcmso_programas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  responsavel_medico TEXT,
  crm TEXT,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  versao INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'ativo',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Exam types catalog
CREATE TABLE public.pcmso_exames_tipos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'periodico',
  validade_meses INTEGER NOT NULL DEFAULT 12,
  exames_complementares TEXT[],
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- PCMSO Events (per collaborator)
CREATE TABLE public.pcmso_eventos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  programa_id UUID REFERENCES public.pcmso_programas(id) ON DELETE SET NULL,
  tipo_exame_id UUID REFERENCES public.pcmso_exames_tipos(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL DEFAULT 'periodico',
  data_prevista DATE,
  data_realizada DATE,
  resultado TEXT,
  observacoes TEXT,
  anexo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ASO Documents
CREATE TABLE public.aso_documentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pcmso_evento_id UUID NOT NULL REFERENCES public.pcmso_eventos(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  tipo_aso TEXT NOT NULL DEFAULT 'periodico',
  resultado TEXT NOT NULL DEFAULT 'apto',
  data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
  validade DATE,
  medico_nome TEXT,
  medico_crm TEXT,
  arquivo_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- Atestados / Absenteísmo
-- =============================================

CREATE TABLE public.atestados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  cid TEXT,
  dias INTEGER NOT NULL DEFAULT 1,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  tipo TEXT NOT NULL DEFAULT 'nao_ocupacional',
  status TEXT NOT NULL DEFAULT 'pendente',
  arquivo_url TEXT,
  observacoes TEXT,
  validado_por UUID,
  validado_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- Documents & Versions (semantic layer over attachments)
-- =============================================

CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  tipo_documento TEXT NOT NULL,
  titulo TEXT NOT NULL,
  referencia_id UUID,
  referencia_tipo TEXT,
  data_emissao DATE,
  validade DATE,
  proximo_vencimento DATE,
  status TEXT NOT NULL DEFAULT 'vigente',
  responsavel_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.document_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  versao INTEGER NOT NULL DEFAULT 1,
  arquivo_url TEXT NOT NULL,
  arquivo_hash TEXT,
  alteracoes TEXT,
  criado_por UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- Signatures & Technical Responsibility
-- =============================================

CREATE TABLE public.signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  signer_name TEXT NOT NULL,
  signer_role TEXT,
  signer_registration TEXT,
  sign_type TEXT NOT NULL DEFAULT 'eletronica',
  signed_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  device_info TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.responsaveis_tecnicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  conselho TEXT NOT NULL,
  numero_registro TEXT NOT NULL,
  uf TEXT,
  especialidade TEXT,
  validade DATE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- Notification User Settings (preferences)
-- =============================================

CREATE TABLE public.notification_user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  muted_types TEXT[] DEFAULT '{}',
  antecedencia_dias INTEGER DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- RLS Policies
-- =============================================

-- PCMSO Programas
ALTER TABLE public.pcmso_programas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read pcmso_programas" ON public.pcmso_programas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage pcmso_programas" ON public.pcmso_programas FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin_master'));
CREATE POLICY "Consultors insert pcmso_programas" ON public.pcmso_programas FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'consultor'));
CREATE POLICY "Consultors update pcmso_programas" ON public.pcmso_programas FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'consultor'));

-- PCMSO Exames Tipos
ALTER TABLE public.pcmso_exames_tipos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read pcmso_exames_tipos" ON public.pcmso_exames_tipos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage pcmso_exames_tipos" ON public.pcmso_exames_tipos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin_master'));

-- PCMSO Eventos
ALTER TABLE public.pcmso_eventos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read pcmso_eventos" ON public.pcmso_eventos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage pcmso_eventos" ON public.pcmso_eventos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin_master'));
CREATE POLICY "Consultors insert pcmso_eventos" ON public.pcmso_eventos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'consultor'));
CREATE POLICY "Consultors update pcmso_eventos" ON public.pcmso_eventos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'consultor'));

-- ASO Documentos
ALTER TABLE public.aso_documentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read aso_documentos" ON public.aso_documentos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage aso_documentos" ON public.aso_documentos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin_master'));
CREATE POLICY "Consultors insert aso_documentos" ON public.aso_documentos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'consultor'));

-- Atestados
ALTER TABLE public.atestados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read atestados" ON public.atestados FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage atestados" ON public.atestados FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin_master'));
CREATE POLICY "Consultors insert atestados" ON public.atestados FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'consultor'));
CREATE POLICY "Consultors update atestados" ON public.atestados FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'consultor'));
CREATE POLICY "Empresa insert atestados" ON public.atestados FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'empresa_admin') OR public.has_role(auth.uid(), 'empresa_gestor'));
CREATE POLICY "Empresa update atestados" ON public.atestados FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'empresa_admin') OR public.has_role(auth.uid(), 'empresa_gestor'));

-- Documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read documents" ON public.documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage documents" ON public.documents FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin_master'));
CREATE POLICY "Consultors insert documents" ON public.documents FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'consultor'));
CREATE POLICY "Consultors update documents" ON public.documents FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'consultor'));

-- Document Versions
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read document_versions" ON public.document_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert document_versions" ON public.document_versions FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- Signatures
ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read signatures" ON public.signatures FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage signatures" ON public.signatures FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin_master'));
CREATE POLICY "Insert signatures" ON public.signatures FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- Responsáveis Técnicos
ALTER TABLE public.responsaveis_tecnicos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read responsaveis_tecnicos" ON public.responsaveis_tecnicos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage responsaveis_tecnicos" ON public.responsaveis_tecnicos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin_master'));

-- Notification User Settings
ALTER TABLE public.notification_user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own settings" ON public.notification_user_settings FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users manage own settings" ON public.notification_user_settings FOR ALL TO authenticated USING (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_pcmso_eventos_colaborador ON public.pcmso_eventos(colaborador_id);
CREATE INDEX idx_pcmso_eventos_empresa ON public.pcmso_eventos(empresa_id);
CREATE INDEX idx_aso_documentos_colaborador ON public.aso_documentos(colaborador_id);
CREATE INDEX idx_atestados_colaborador ON public.atestados(colaborador_id);
CREATE INDEX idx_atestados_empresa ON public.atestados(empresa_id);
CREATE INDEX idx_documents_empresa ON public.documents(empresa_id);
CREATE INDEX idx_documents_vencimento ON public.documents(proximo_vencimento);
CREATE INDEX idx_signatures_document ON public.signatures(document_id);
