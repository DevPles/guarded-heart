import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Props {
  eventos: any[];
  programas: any[];
}

const PCMSODashboard = ({ eventos, programas }: Props) => {
  const today = new Date();
  const in30 = new Date(); in30.setDate(today.getDate() + 30);
  const in60 = new Date(); in60.setDate(today.getDate() + 60);

  const vencidos = eventos.filter(e => !e.data_realizada && e.data_prevista && new Date(e.data_prevista) < today);
  const pendentes = eventos.filter(e => !e.data_realizada);
  const proximosVencer = eventos.filter(e => !e.data_realizada && e.data_prevista && new Date(e.data_prevista) >= today && new Date(e.data_prevista) <= in30);
  const realizados = eventos.filter(e => !!e.data_realizada);
  const aptos = eventos.filter(e => e.resultado === 'apto');
  const inaptos = eventos.filter(e => e.resultado === 'inapto' || e.resultado === 'apto_restricao');
  const programasAtivos = programas.filter(p => p.status === 'ativo');

  const conformidade = eventos.length > 0 ? Math.round((realizados.length / eventos.length) * 100) : 100;

  const stats = [
    { label: 'Exames Vencidos', value: vencidos.length, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-900', urgent: vencidos.length > 0 },
    { label: 'Próximos 30 dias', value: proximosVencer.length, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-900', urgent: proximosVencer.length > 0 },
    { label: 'Pendentes', value: pendentes.length, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-900', urgent: false },
    { label: 'Realizados', value: realizados.length, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-900', urgent: false },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className={`${s.bg} ${s.border} border relative overflow-hidden`}>
            {s.urgent && (
              <div className="absolute top-0 right-0 w-2 h-full bg-current opacity-40" style={{ color: s.color.replace('text-', '') }} />
            )}
            <CardContent className="p-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{s.label}</p>
                <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conformidade + Resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardContent className="p-5 space-y-4">
            <div>
              <h3 className="font-semibold text-sm">Índice de Conformidade</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" className="stroke-muted" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" className={conformidade >= 80 ? 'stroke-green-500' : conformidade >= 50 ? 'stroke-amber-500' : 'stroke-red-500'} strokeWidth="3" strokeDasharray={`${conformidade}, 100`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">{conformidade}%</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>{realizados.length} exames realizados</p>
                <p>{pendentes.length} aguardando execução</p>
                <p>{vencidos.length} em atraso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardContent className="p-5 space-y-3">
            <div>
              <h3 className="font-semibold text-sm">Resultados Clínicos</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Aptos</span>
                <span className="font-medium text-green-600">{aptos.length}</span>
              </div>
              <Progress value={eventos.length ? (aptos.length / eventos.length) * 100 : 0} className="h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Inaptos / Restrição</span>
                <span className="font-medium text-red-600">{inaptos.length}</span>
              </div>
              <Progress value={eventos.length ? (inaptos.length / eventos.length) * 100 : 0} className="h-2 [&>div]:bg-red-500" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sem resultado</span>
                <span className="font-medium">{eventos.length - aptos.length - inaptos.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardContent className="p-5 space-y-3">
            <div>
              <h3 className="font-semibold text-sm">Programas Ativos</h3>
            </div>
            <p className="text-3xl font-bold text-primary">{programasAtivos.length}</p>
            <p className="text-xs text-muted-foreground">{programas.length} total registrados</p>
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">
                {new Set(eventos.map(e => e.colaborador_id)).size} colaboradores acompanhados
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {vencidos.length > 0 && (
        <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <h3 className="font-semibold text-sm text-red-700 dark:text-red-400">Exames Vencidos — Ação Imediata</h3>
            </div>
            <div className="space-y-2">
              {vencidos.slice(0, 5).map(e => (
                <div key={e.id} className="flex items-center justify-between text-sm bg-white/70 dark:bg-background/50 rounded-lg px-3 py-2">
                  <div>
                    <span className="font-medium">{e.colaboradores?.nome_completo || '—'}</span>
                    <span className="text-muted-foreground ml-2">• {e.tipo}</span>
                  </div>
                  <Badge variant="outline" className="bg-red-100 text-red-700 text-xs">
                    Vencido em {e.data_prevista}
                  </Badge>
                </div>
              ))}
              {vencidos.length > 5 && (
                <p className="text-xs text-red-600 pl-1">+ {vencidos.length - 5} exames vencidos</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {proximosVencer.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock className="h-4 w-4 text-amber-600" />
              <h3 className="font-semibold text-sm text-amber-700 dark:text-amber-400">Vencendo nos próximos 30 dias</h3>
            </div>
            <div className="space-y-2">
              {proximosVencer.slice(0, 5).map(e => (
                <div key={e.id} className="flex items-center justify-between text-sm bg-white/70 dark:bg-background/50 rounded-lg px-3 py-2">
                  <div>
                    <span className="font-medium">{e.colaboradores?.nome_completo || '—'}</span>
                    <span className="text-muted-foreground ml-2">• {e.tipo}</span>
                  </div>
                  <Badge variant="outline" className="bg-amber-100 text-amber-700 text-xs">
                    Previsto: {e.data_prevista}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PCMSODashboard;
