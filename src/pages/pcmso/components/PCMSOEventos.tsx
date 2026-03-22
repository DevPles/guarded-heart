import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';


interface Props {
  empresas: any[];
  eventos: any[];
  empresaFilter: string;
}

const PCMSOEventos = ({ empresas, eventos, empresaFilter }: Props) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [form, setForm] = useState({
    empresa_id: '', colaborador_id: '', tipo: 'periodico', data_prevista: '', data_realizada: '', resultado: '', observacoes: '',
  });

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores-pcmso', form.empresa_id],
    queryFn: async () => {
      if (!form.empresa_id) return [];
      const { data } = await supabase.from('colaboradores').select('id, nome_completo').eq('empresa_id', form.empresa_id).eq('status', 'ativo');
      return data ?? [];
    },
    enabled: !!form.empresa_id,
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('pcmso_eventos').insert(form as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pcmso-eventos'] });
      toast({ title: 'Evento PCMSO registrado' });
      setShowNew(false);
      setForm({ empresa_id: '', colaborador_id: '', tipo: 'periodico', data_prevista: '', data_realizada: '', resultado: '', observacoes: '' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const isOverdue = (dp: string, dr: string | null) => !dr && dp && new Date(dp) < new Date();

  const tipoLabels: Record<string, string> = {
    admissional: 'Admissional',
    periodico: 'Periódico',
    retorno: 'Retorno ao Trabalho',
    mudanca_risco: 'Mudança de Função',
    demissional: 'Demissional',
  };

  const filteredEventos = eventos.filter(ev => {
    if (searchTerm && !ev.colaboradores?.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (tipoFilter !== 'all' && ev.tipo !== tipoFilter) return false;
    if (statusFilter === 'realizado' && !ev.data_realizada) return false;
    if (statusFilter === 'pendente' && ev.data_realizada) return false;
    if (statusFilter === 'vencido' && !isOverdue(ev.data_prevista, ev.data_realizada)) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px] max-w-xs">
          <Input placeholder="Buscar colaborador..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {Object.entries(tipoLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="realizado">Realizados</SelectItem>
            <SelectItem value="vencido">Vencidos</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <Dialog open={showNew} onOpenChange={setShowNew}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Novo Exame
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Registrar Exame / Evento</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Empresa</Label>
                  <Select value={form.empresa_id} onValueChange={v => setForm(p => ({ ...p, empresa_id: v, colaborador_id: '' }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>{empresas.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.razao_social}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Colaborador</Label>
                  <Select value={form.colaborador_id} onValueChange={v => setForm(p => ({ ...p, colaborador_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>{colaboradores.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.nome_completo}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={form.tipo} onValueChange={v => setForm(p => ({ ...p, tipo: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(tipoLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Resultado</Label>
                    <Select value={form.resultado} onValueChange={v => setForm(p => ({ ...p, resultado: v }))}>
                      <SelectTrigger><SelectValue placeholder="Pendente" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apto">Apto</SelectItem>
                        <SelectItem value="inapto">Inapto</SelectItem>
                        <SelectItem value="apto_restricao">Apto c/ Restrição</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data Prevista</Label>
                    <Input type="date" value={form.data_prevista} onChange={e => setForm(p => ({ ...p, data_prevista: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Realizada</Label>
                    <Input type="date" value={form.data_realizada} onChange={e => setForm(p => ({ ...p, data_realizada: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea value={form.observacoes} onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))} />
                </div>
                <Button onClick={() => create.mutate()} disabled={!form.empresa_id || !form.colaborador_id} className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Registrar Exame
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant="outline" className="bg-muted/50">{filteredEventos.length} exames</Badge>
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">{filteredEventos.filter(e => isOverdue(e.data_prevista, e.data_realizada)).length} vencidos</Badge>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{filteredEventos.filter(e => e.resultado === 'apto').length} aptos</Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data Prevista</TableHead>
                <TableHead>Realizado</TableHead>
                <TableHead>Resultado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEventos.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum evento encontrado</TableCell></TableRow>
              ) : filteredEventos.map((ev: any) => (
                <TableRow key={ev.id} className={isOverdue(ev.data_prevista, ev.data_realizada) ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                  <TableCell className="font-medium">{ev.colaboradores?.nome_completo}</TableCell>
                  <TableCell>{ev.empresas?.razao_social}</TableCell>
                  <TableCell>{tipoLabels[ev.tipo] || ev.tipo}</TableCell>
                  <TableCell>{ev.data_prevista || '—'}</TableCell>
                  <TableCell>{ev.data_realizada || <Badge variant="outline" className="bg-amber-100 text-amber-700">Pendente</Badge>}</TableCell>
                  <TableCell>
                    {ev.resultado ? (
                      <Badge variant="outline" className={
                        ev.resultado === 'apto' ? 'bg-green-100 text-green-700' :
                        ev.resultado === 'apto_restricao' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }>
                        {ev.resultado === 'apto_restricao' ? 'Apto c/ Restrição' : ev.resultado}
                      </Badge>
                    ) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PCMSOEventos;
