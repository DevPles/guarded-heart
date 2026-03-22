import { useNavigate } from 'react-router-dom';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NavCard {
  title: string;
  description: string;
  path: string;
  countQuery?: string;
  allowedRoles: AppRole[];
}

const navCards: NavCard[] = [
  {
    title: 'Cadastros',
    description: 'Gestão de empresas, colaboradores, unidades, setores e cargos',
    path: '/cadastros',
    countQuery: 'empresas',
    allowedRoles: ['admin_master', 'consultor', 'empresa_admin', 'empresa_gestor'],
  },
  {
    title: 'Avaliações AEP',
    description: 'Avaliação Ergonômica Preliminar com formulário completo e score automático',
    path: '/aep',
    countQuery: 'aep',
    allowedRoles: ['admin_master', 'consultor'],
  },
  {
    title: 'Análises AET',
    description: 'Análise Ergonômica do Trabalho aprofundada conforme NR-17',
    path: '/aet',
    countQuery: 'aet',
    allowedRoles: ['admin_master', 'consultor'],
  },
  {
    title: 'Riscos Psicossociais',
    description: 'Avaliação de fatores psicossociais e organizacionais com matriz S×P',
    path: '/riscos-psicossociais',
    countQuery: 'arp',
    allowedRoles: ['admin_master', 'consultor'],
  },
  {
    title: 'Checklists Mensais',
    description: 'Monitoramento contínuo mensal dos colaboradores',
    path: '/checklists',
    countQuery: 'checklists',
    allowedRoles: ['admin_master', 'consultor', 'empresa_admin', 'empresa_gestor'],
  },
  {
    title: 'Planos de Ação',
    description: 'Gestão de ações corretivas e preventivas',
    path: '/planos-acao',
    countQuery: 'action_plans',
    allowedRoles: ['admin_master', 'consultor', 'empresa_admin', 'empresa_gestor'],
  },
  {
    title: 'Laudos e Relatórios',
    description: 'Geração e gestão de documentos e laudos em PDF',
    path: '/laudos',
    allowedRoles: ['admin_master', 'consultor', 'empresa_admin', 'empresa_gestor'],
  },
  {
    title: 'Dashboard',
    description: 'Indicadores, gráficos e visão gerencial',
    path: '/dashboard',
    allowedRoles: ['admin_master', 'consultor', 'empresa_admin', 'empresa_gestor'],
  },
  {
    title: 'Configurações',
    description: 'Usuários, perfis, templates e parâmetros do sistema',
    path: '/configuracoes',
    allowedRoles: ['admin_master'],
  },
];

const ROLE_LABELS: Record<AppRole, string> = {
  admin_master: 'Administrador Master',
  consultor: 'Consultor / Avaliador',
  empresa_admin: 'Administrador da Empresa',
  empresa_gestor: 'Gestor da Empresa',
  colaborador: 'Colaborador',
};

const Home = () => {
  const navigate = useNavigate();
  const { hasAnyRole, primaryRole } = useAuth();

  const { data: counts } = useQuery({
    queryKey: ['home-counts'],
    queryFn: async () => {
      const [empresas, colaboradores, aep, aet, arp, checklists, action_plans] = await Promise.all([
        supabase.from('empresas').select('id', { count: 'exact', head: true }),
        supabase.from('colaboradores').select('id', { count: 'exact', head: true }),
        supabase.from('assessments').select('id', { count: 'exact', head: true }).eq('type', 'aep'),
        supabase.from('assessments').select('id', { count: 'exact', head: true }).eq('type', 'aet'),
        supabase.from('assessments').select('id', { count: 'exact', head: true }).eq('type', 'arp'),
        supabase.from('checklists').select('id', { count: 'exact', head: true }),
        supabase.from('action_plans').select('id', { count: 'exact', head: true }),
      ]);
      return {
        empresas: empresas.count ?? 0,
        colaboradores: colaboradores.count ?? 0,
        aep: aep.count ?? 0,
        aet: aet.count ?? 0,
        arp: arp.count ?? 0,
        checklists: checklists.count ?? 0,
        action_plans: action_plans.count ?? 0,
      };
    },
  });

  const visibleCards = navCards.filter((card) =>
    hasAnyRole(...card.allowedRoles)
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Painel Principal</h1>
        <p className="text-muted-foreground mt-1">
          {primaryRole ? ROLE_LABELS[primaryRole] : 'Selecione um módulo para começar'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleCards.map((card) => (
          <Card
            key={card.path}
            className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 group h-full flex flex-col"
            onClick={() => navigate(card.path)}
          >
            <CardContent className="p-6 flex flex-col flex-1">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors" style={{ fontFamily: 'Space Grotesk' }}>
                {card.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed flex-1">
                {card.description}
              </p>
              <div className="mt-4 pt-4 border-t">
                {card.countQuery && counts ? (
                  <>
                    <span className="text-2xl font-bold text-foreground">
                      {counts[card.countQuery as keyof typeof counts] ?? 0}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">registros</span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">Acessar módulo</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Home;
