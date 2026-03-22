
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin_master', 'consultor', 'empresa_gestor', 'colaborador', 'empresa_admin');
CREATE TYPE public.assessment_status AS ENUM ('rascunho', 'em_andamento', 'finalizado', 'cancelado');
CREATE TYPE public.assessment_type AS ENUM ('aep', 'aet', 'arp');
CREATE TYPE public.risk_classification AS ENUM ('baixo', 'moderado', 'alto', 'critico');
CREATE TYPE public.action_plan_status AS ENUM ('pendente', 'em_andamento', 'concluido', 'vencido');

-- Update trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Empresas
CREATE TABLE public.empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  cnpj TEXT,
  cnae TEXT,
  grau_risco INT,
  endereco_logradouro TEXT,
  endereco_numero TEXT,
  endereco_complemento TEXT,
  endereco_bairro TEXT,
  endereco_cidade TEXT,
  endereco_uf TEXT,
  endereco_cep TEXT,
  responsavel_nome TEXT,
  responsavel_email TEXT,
  responsavel_telefone TEXT,
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  empresa_id UUID REFERENCES public.empresas(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

-- get_user_empresa_id function
CREATE OR REPLACE FUNCTION public.get_user_empresa_id(_user_id UUID)
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT empresa_id FROM public.profiles WHERE id = _user_id $$;

-- Planos
CREATE TABLE public.planos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL, descricao TEXT,
  limite_usuarios INT NOT NULL DEFAULT 5, limite_colaboradores INT NOT NULL DEFAULT 50,
  limite_avaliacoes INT NOT NULL DEFAULT 100, valor_mensal NUMERIC,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;

-- Contratos
CREATE TABLE public.contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  plano_id UUID NOT NULL REFERENCES public.planos(id),
  valor_mensal NUMERIC, data_inicio DATE NOT NULL DEFAULT CURRENT_DATE, data_fim DATE,
  status TEXT NOT NULL DEFAULT 'ativo', observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;

-- Unidades
CREATE TABLE public.unidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL, endereco TEXT, ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;

-- Setores
CREATE TABLE public.setores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  unidade_id UUID REFERENCES public.unidades(id),
  nome TEXT NOT NULL, descricao TEXT, ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.setores ENABLE ROW LEVEL SECURITY;

-- Cargos
CREATE TABLE public.cargos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  setor_id UUID REFERENCES public.setores(id),
  nome TEXT NOT NULL, cbo TEXT, descricao TEXT, ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cargos ENABLE ROW LEVEL SECURITY;

-- Colaboradores
CREATE TABLE public.colaboradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  nome_completo TEXT NOT NULL, matricula TEXT, cpf TEXT,
  data_nascimento DATE, sexo TEXT,
  unidade_id UUID REFERENCES public.unidades(id),
  setor_id UUID REFERENCES public.setores(id),
  cargo_id UUID REFERENCES public.cargos(id),
  data_admissao DATE, jornada TEXT, turno TEXT, gestor_responsavel TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;

-- Assessments
CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.assessment_type NOT NULL,
  title TEXT NOT NULL DEFAULT 'Sem título',
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  unidade_id UUID REFERENCES public.unidades(id),
  setor_id UUID REFERENCES public.setores(id),
  cargo_id UUID REFERENCES public.cargos(id),
  colaborador_id UUID REFERENCES public.colaboradores(id),
  evaluator_id UUID REFERENCES auth.users(id),
  description TEXT,
  status public.assessment_status NOT NULL DEFAULT 'rascunho',
  score_total NUMERIC, risk_classification public.risk_classification,
  needs_aet BOOLEAN DEFAULT false, version INT DEFAULT 1,
  finalized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Assessment items
CREATE TABLE public.assessment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  domain TEXT NOT NULL, question_number INT NOT NULL, question_text TEXT NOT NULL,
  weight NUMERIC, value INT, na_flag BOOLEAN DEFAULT false, comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.assessment_items ENABLE ROW LEVEL SECURITY;

-- Action plans
CREATE TABLE public.action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.assessments(id),
  colaborador_id UUID REFERENCES public.colaboradores(id),
  setor_id UUID REFERENCES public.setores(id),
  action TEXT NOT NULL, origin TEXT NOT NULL DEFAULT 'manual',
  priority TEXT, responsible TEXT, due_date DATE,
  status public.action_plan_status NOT NULL DEFAULT 'pendente',
  evidence TEXT, completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;

-- Checklists
CREATE TABLE public.checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  month INT NOT NULL, year INT NOT NULL,
  responses JSONB NOT NULL DEFAULT '{}', score NUMERIC,
  observations TEXT, confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;

-- Attachments
CREATE TABLE public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL, file_url TEXT NOT NULL,
  file_hash TEXT, kind TEXT NOT NULL DEFAULT 'photo',
  metadata JSONB, uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- Risk events
CREATE TABLE public.risk_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  hazard TEXT NOT NULL, severity INT NOT NULL, probability INT NOT NULL,
  risk_score NUMERIC, classification public.risk_classification,
  recommendations TEXT, evidence_links TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.risk_events ENABLE ROW LEVEL SECURITY;

-- Audit logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  empresa_id UUID REFERENCES public.empresas(id),
  entity_type TEXT NOT NULL, entity_id UUID, action TEXT NOT NULL,
  old_data JSONB, new_data JSONB, ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Consultor empresas
CREATE TABLE public.consultor_empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nivel_atuacao TEXT, ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, empresa_id)
);
ALTER TABLE public.consultor_empresas ENABLE ROW LEVEL SECURITY;

-- Triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON public.empresas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_unidades_updated_at BEFORE UPDATE ON public.unidades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_setores_updated_at BEFORE UPDATE ON public.setores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cargos_updated_at BEFORE UPDATE ON public.cargos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_colaboradores_updated_at BEFORE UPDATE ON public.colaboradores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_action_plans_updated_at BEFORE UPDATE ON public.action_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_planos_updated_at BEFORE UPDATE ON public.planos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contratos_updated_at BEFORE UPDATE ON public.contratos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Profile auto-creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "User roles viewable" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin_master'));

CREATE POLICY "Empresas viewable" ON public.empresas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage empresas" ON public.empresas FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin_master'));
CREATE POLICY "Consultors insert empresas" ON public.empresas FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'consultor'));
CREATE POLICY "Consultors update empresas" ON public.empresas FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'consultor'));

CREATE POLICY "Read unidades" ON public.unidades FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage unidades" ON public.unidades FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin_master'));

CREATE POLICY "Read setores" ON public.setores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage setores" ON public.setores FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin_master'));

CREATE POLICY "Read cargos" ON public.cargos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage cargos" ON public.cargos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin_master'));

CREATE POLICY "Read colaboradores" ON public.colaboradores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage colaboradores" ON public.colaboradores FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin_master'));
CREATE POLICY "Consultors insert colaboradores" ON public.colaboradores FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'consultor'));
CREATE POLICY "Consultors update colaboradores" ON public.colaboradores FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'consultor'));

CREATE POLICY "Read assessments" ON public.assessments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage assessments" ON public.assessments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin_master'));
CREATE POLICY "Consultors insert assessments" ON public.assessments FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'consultor'));
CREATE POLICY "Consultors update assessments" ON public.assessments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'consultor'));
CREATE POLICY "Consultors delete assessments" ON public.assessments FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'consultor'));

CREATE POLICY "Read assessment_items" ON public.assessment_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage assessment_items" ON public.assessment_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin_master'));
CREATE POLICY "Consultors insert items" ON public.assessment_items FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'consultor'));
CREATE POLICY "Consultors update items" ON public.assessment_items FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'consultor'));
CREATE POLICY "Consultors delete items" ON public.assessment_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'consultor'));

CREATE POLICY "Read action_plans" ON public.action_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage action_plans" ON public.action_plans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin_master'));
CREATE POLICY "Consultors insert plans" ON public.action_plans FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'consultor'));
CREATE POLICY "Consultors update plans" ON public.action_plans FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'consultor'));
CREATE POLICY "Consultors delete plans" ON public.action_plans FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'consultor'));

CREATE POLICY "Read checklists" ON public.checklists FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert checklists" ON public.checklists FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Read attachments" ON public.attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert attachments" ON public.attachments FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Read risk_events" ON public.risk_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage risk_events" ON public.risk_events FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin_master'));

CREATE POLICY "Read audit_logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert audit_logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Read planos" ON public.planos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage planos" ON public.planos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin_master'));

CREATE POLICY "Read contratos" ON public.contratos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage contratos" ON public.contratos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin_master'));

CREATE POLICY "Read consultor_empresas" ON public.consultor_empresas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage consultor_empresas" ON public.consultor_empresas FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin_master'));

-- Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Public avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Upload avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Update avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "Public attachments" ON storage.objects FOR SELECT USING (bucket_id = 'attachments');
CREATE POLICY "Upload attachments" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'attachments');
