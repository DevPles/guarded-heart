import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface Props {
  eventos: any[];
}

const PCMSOHistorico = ({ eventos }: Props) => {
  const [colaboradorFilter, setColaboradorFilter] = useState('all');

  const colaboradores = [...new Map(eventos.map(e => [e.colaborador_id, { id: e.colaborador_id, nome: e.colaboradores?.nome_completo }])).values()].filter(c => c.nome);

  const filtered = colaboradorFilter === 'all' ? eventos : eventos.filter(e => e.colaborador_id === colaboradorFilter);
  const sorted = [...filtered].sort((a, b) => new Date(b.data_prevista || b.created_at).getTime() - new Date(a.data_prevista || a.created_at).getTime());

  const getIcon = (ev: any) => {
    if (ev.data_realizada && ev.resultado === 'apto') return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (ev.data_realizada && ev.resultado === 'inapto') return <AlertTriangle className="h-4 w-4 text-red-600" />;
    if (ev.data_realizada) return <FileText className="h-4 w-4 text-blue-600" />;
    if (!ev.data_realizada && ev.data_prevista && new Date(ev.data_prevista) < new Date()) return <AlertTriangle className="h-4 w-4 text-red-600" />;
    return <Clock className="h-4 w-4 text-amber-600" />;
  };

  const tipoLabels: Record<string, string> = {
    admissional: 'Admissional', periodico: 'Periódico', retorno: 'Retorno ao Trabalho',
    mudanca_risco: 'Mudança de Função', demissional: 'Demissional',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={colaboradorFilter} onValueChange={setColaboradorFilter}>
          <SelectTrigger className="w-72"><SelectValue placeholder="Filtrar por colaborador..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os colaboradores</SelectItem>
            {colaboradores.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="bg-muted/50">{sorted.length} registros</Badge>
      </div>

      {sorted.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>Nenhum registro encontrado para exibir o histórico.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative pl-6">
          {/* Timeline line */}
          <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-4">
            {sorted.map(ev => {
              const isVencido = !ev.data_realizada && ev.data_prevista && new Date(ev.data_prevista) < new Date();
              return (
                <div key={ev.id} className="relative flex gap-4">
                  {/* Dot */}
                  <div className="absolute -left-6 top-3 w-3 h-3 rounded-full border-2 border-background bg-primary z-10" />

                  <Card className={`flex-1 ${isVencido ? 'border-red-200 dark:border-red-900' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getIcon(ev)}
                          <div>
                            <p className="font-medium text-sm">{ev.colaboradores?.nome_completo}</p>
                            <p className="text-xs text-muted-foreground">{ev.empresas?.razao_social}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">{tipoLabels[ev.tipo] || ev.tipo}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {ev.data_prevista || '—'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-3 text-xs">
                        {ev.data_realizada ? (
                          <span className="text-green-600">✓ Realizado em {ev.data_realizada}</span>
                        ) : isVencido ? (
                          <span className="text-red-600 font-medium">⚠ Vencido — ação necessária</span>
                        ) : (
                          <span className="text-amber-600">⏳ Aguardando realização</span>
                        )}
                        {ev.resultado && (
                          <Badge variant="outline" className={
                            ev.resultado === 'apto' ? 'bg-green-100 text-green-700' :
                            ev.resultado === 'apto_restricao' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }>
                            {ev.resultado === 'apto_restricao' ? 'Apto c/ Restrição' : ev.resultado}
                          </Badge>
                        )}
                      </div>
                      {ev.observacoes && (
                        <p className="text-xs text-muted-foreground mt-2 italic">"{ev.observacoes}"</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PCMSOHistorico;
