import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const DashboardPage = () => {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [empresas, colaboradores, aepTotal, aetTotal, arpTotal, plansPending, plansOverdue, checklists, highRisk, criticalRisk] = await Promise.all([
        supabase.from('empresas').select('id', { count: 'exact', head: true }),
        supabase.from('colaboradores').select('id', { count: 'exact', head: true }),
        supabase.from('assessments').select('id', { count: 'exact', head: true }).eq('type', 'aep'),
        supabase.from('assessments').select('id', { count: 'exact', head: true }).eq('type', 'aet'),
        supabase.from('assessments').select('id', { count: 'exact', head: true }).eq('type', 'arp'),
        supabase.from('action_plans').select('id', { count: 'exact', head: true }).eq('status', 'pendente'),
        supabase.from('action_plans').select('id', { count: 'exact', head: true }).eq('status', 'vencido'),
        supabase.from('checklists').select('id', { count: 'exact', head: true }),
        supabase.from('assessments').select('id', { count: 'exact', head: true }).eq('risk_classification', 'alto'),
        supabase.from('assessments').select('id', { count: 'exact', head: true }).eq('risk_classification', 'critico'),
      ]);
      return {
        empresas: empresas.count ?? 0,
        colaboradores: colaboradores.count ?? 0,
        aep: aepTotal.count ?? 0,
        aet: aetTotal.count ?? 0,
        arp: arpTotal.count ?? 0,
        plansPending: plansPending.count ?? 0,
        plansOverdue: plansOverdue.count ?? 0,
        checklists: checklists.count ?? 0,
        highRisk: highRisk.count ?? 0,
        criticalRisk: criticalRisk.count ?? 0,
      };
    },
  });

  const cards = [
    { label: 'Empresas', value: stats?.empresas ?? 0 },
    { label: 'Colaboradores', value: stats?.colaboradores ?? 0 },
    { label: 'Avaliações AEP', value: stats?.aep ?? 0 },
    { label: 'Análises AET', value: stats?.aet ?? 0 },
    { label: 'Avaliações ARP', value: stats?.arp ?? 0 },
    { label: 'Checklists', value: stats?.checklists ?? 0 },
    { label: 'Riscos Altos', value: stats?.highRisk ?? 0, variant: 'destructive' as const },
    { label: 'Riscos Críticos', value: stats?.criticalRisk ?? 0, variant: 'destructive' as const },
    { label: 'Planos Pendentes', value: stats?.plansPending ?? 0 },
    { label: 'Planos Vencidos', value: stats?.plansOverdue ?? 0, variant: 'destructive' as const },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard Executivo</h1>
        <p className="text-muted-foreground">Indicadores e visão gerencial</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-foreground">{card.value}</span>
                {card.variant && card.value > 0 && <Badge variant={card.variant}>Atenção</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Resumo</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            O dashboard com gráficos de evolução, mapas de calor e distribuição por setor será expandido nas próximas fases com visualizações detalhadas usando Recharts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
