import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, FileText, Calendar, Activity } from 'lucide-react';

const PCMSOPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [empresaFilter, setEmpresaFilter] = useState('all');
  const [showNewPrograma, setShowNewPrograma] = useState(false);
  const [showNewEvento, setShowNewEvento] = useState(false);

  // Form state - Programa
  const [progForm, setProgForm] = useState({
    empresa_id: '', responsavel_medico: '', crm: '', data_inicio: '', data_fim: '', observacoes: '',
  });

  // Form state - Evento
  const [eventoForm, setEventoForm] = useState({
    empresa_id: '', colaborador_id: '', tipo: 'periodico', data_prevista: '', data_realizada: '', resultado: '', observacoes: '',
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas-pcmso'],
    queryFn: async () => {
      const { data } = await supabase.from('empresas').select('id, razao_social').eq('ativa', true).order('razao_social');
      return data ?? [];
    },
  });

  const { data: programas = [] } = useQuery({
    queryKey: ['pcmso-programas', empresaFilter],
    queryFn: async () => {
      let q = supabase.from('pcmso_programas').select('*, empresas:empresa_id(razao_social)').order('created_at', { ascending: false });
      if (empresaFilter !== 'all') q = q.eq('empresa_id', empresaFilter);
      const { data } = await q;
      return (data ?? []) as any[];
    },
  });

  const { data: eventos = [] } = useQuery({
    queryKey: ['pcmso-eventos', empresaFilter],
    queryFn: async () => {
      let q = supabase.from('pcmso_eventos').select('*, colaboradores:colaborador_id(nome_completo), empresas:empresa_id(razao_social)').order('data_prevista', { ascending: true });
      if (empresaFilter !== 'all') q = q.eq('empresa_id', empresaFilter);
      const { data } = await q.limit(100);
      return (data ?? []) as any[];
    },
  });

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores-pcmso', eventoForm.empresa_id],
    queryFn: async () => {
      if (!eventoForm.empresa_id) return [];
      const { data } = await supabase.from('colaboradores').select('id, nome_completo').eq('empresa_id', eventoForm.empresa_id).eq('status', 'ativo');
      return data ?? [];
    },
    enabled: !!eventoForm.empresa_id,
  });

  const createPrograma = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('pcmso_programas').insert(progForm as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pcmso-programas'] });
      toast({ title: 'Programa PCMSO criado' });
      setShowNewPrograma(false);
      setProgForm({ empresa_id: '', responsavel_medico: '', crm: '', data_inicio: '', data_fim: '', observacoes: '' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const createEvento = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('pcmso_eventos').insert(eventoForm as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pcmso-eventos'] });
      toast({ title: 'Evento PCMSO registrado' });
      setShowNewEvento(false);
      setEventoForm({ empresa_id: '', colaborador_id: '', tipo: 'periodico', data_prevista: '', data_realizada: '', resultado: '', observacoes: '' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const statusColor = (status: string) => {
    if (status === 'ativo') return 'bg-green-100 text-green-700';
    if (status === 'encerrado') return 'bg-muted text-muted-foreground';
    return 'bg-amber-100 text-amber-700';
  };

  const isOverdue = (dataPrevista: string, dataRealizada: string | null) => {
    if (dataRealizada) return false;
    return new Date(dataPrevista) < new Date();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">PCMSO — Saúde Ocupacional</h1>
          <p className="text-muted-foreground">Gestão de programas, exames e ASOs (NR-07)</p>
        </div>
        <div className="flex gap-2">
          <Select value={empresaFilter} onValueChange={setEmpresaFilter}>
            <SelectTrigger className="w-60"><SelectValue placeholder="Filtrar empresa..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {empresas.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.razao_social}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="programas">
        <TabsList>
          <TabsTrigger value="programas"><FileText className="h-4 w-4 mr-1" /> Programas</TabsTrigger>
          <TabsTrigger value="eventos"><Calendar className="h-4 w-4 mr-1" /> Exames / Eventos</TabsTrigger>
        </TabsList>

        <TabsContent value="programas" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={showNewPrograma} onOpenChange={setShowNewPrograma}>
              <DialogTrigger asChild>
                <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="h-4 w-4 mr-1" /> Novo Programa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Novo Programa PCMSO</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Empresa</Label>
                    <Select value={progForm.empresa_id} onValueChange={v => setProgForm(p => ({ ...p, empresa_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>{empresas.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.razao_social}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Médico Responsável</Label>
                      <Input value={progForm.responsavel_medico} onChange={e => setProgForm(p => ({ ...p, responsavel_medico: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>CRM</Label>
                      <Input value={progForm.crm} onChange={e => setProgForm(p => ({ ...p, crm: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data Início</Label>
                      <Input type="date" value={progForm.data_inicio} onChange={e => setProgForm(p => ({ ...p, data_inicio: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Data Fim</Label>
                      <Input type="date" value={progForm.data_fim} onChange={e => setProgForm(p => ({ ...p, data_fim: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea value={progForm.observacoes} onChange={e => setProgForm(p => ({ ...p, observacoes: e.target.value }))} />
                  </div>
                  <Button onClick={() => createPrograma.mutate()} disabled={!progForm.empresa_id || !progForm.data_inicio} className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Criar Programa
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>CRM</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programas.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum programa cadastrado</TableCell></TableRow>
                  ) : programas.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.empresas?.razao_social}</TableCell>
                      <TableCell>{p.responsavel_medico || '—'}</TableCell>
                      <TableCell>{p.crm || '—'}</TableCell>
                      <TableCell>{p.data_inicio} → {p.data_fim || '∞'}</TableCell>
                      <TableCell><Badge variant="outline" className={statusColor(p.status)}>{p.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eventos" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={showNewEvento} onOpenChange={setShowNewEvento}>
              <DialogTrigger asChild>
                <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="h-4 w-4 mr-1" /> Novo Exame
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Registrar Exame / Evento</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Empresa</Label>
                    <Select value={eventoForm.empresa_id} onValueChange={v => setEventoForm(p => ({ ...p, empresa_id: v, colaborador_id: '' }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>{empresas.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.razao_social}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Colaborador</Label>
                    <Select value={eventoForm.colaborador_id} onValueChange={v => setEventoForm(p => ({ ...p, colaborador_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>{colaboradores.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.nome_completo}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={eventoForm.tipo} onValueChange={v => setEventoForm(p => ({ ...p, tipo: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admissional">Admissional</SelectItem>
                          <SelectItem value="periodico">Periódico</SelectItem>
                          <SelectItem value="retorno">Retorno ao trabalho</SelectItem>
                          <SelectItem value="mudanca_risco">Mudança de risco</SelectItem>
                          <SelectItem value="demissional">Demissional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Resultado</Label>
                      <Select value={eventoForm.resultado} onValueChange={v => setEventoForm(p => ({ ...p, resultado: v }))}>
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
                      <Input type="date" value={eventoForm.data_prevista} onChange={e => setEventoForm(p => ({ ...p, data_prevista: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Data Realizada</Label>
                      <Input type="date" value={eventoForm.data_realizada} onChange={e => setEventoForm(p => ({ ...p, data_realizada: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea value={eventoForm.observacoes} onChange={e => setEventoForm(p => ({ ...p, observacoes: e.target.value }))} />
                  </div>
                  <Button onClick={() => createEvento.mutate()} disabled={!eventoForm.empresa_id || !eventoForm.colaborador_id} className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Registrar Exame
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
                  {eventos.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum evento registrado</TableCell></TableRow>
                  ) : eventos.map((ev: any) => (
                    <TableRow key={ev.id} className={isOverdue(ev.data_prevista, ev.data_realizada) ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                      <TableCell className="font-medium">{ev.colaboradores?.nome_completo}</TableCell>
                      <TableCell>{ev.empresas?.razao_social}</TableCell>
                      <TableCell className="capitalize">{ev.tipo}</TableCell>
                      <TableCell>{ev.data_prevista || '—'}</TableCell>
                      <TableCell>{ev.data_realizada || <Badge variant="outline" className="bg-amber-100 text-amber-700">Pendente</Badge>}</TableCell>
                      <TableCell>{ev.resultado ? <Badge variant="outline" className={ev.resultado === 'apto' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{ev.resultado}</Badge> : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PCMSOPage;
