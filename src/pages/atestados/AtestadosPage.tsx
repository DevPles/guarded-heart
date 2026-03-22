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
import { Plus, FileWarning } from 'lucide-react';

const AtestadosPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [empresaFilter, setEmpresaFilter] = useState('');
  const [showNew, setShowNew] = useState(false);

  const [form, setForm] = useState({
    empresa_id: '', colaborador_id: '', cid: '', dias: '1', data_inicio: '', data_fim: '',
    tipo: 'nao_ocupacional', observacoes: '',
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas-atestados'],
    queryFn: async () => {
      const { data } = await supabase.from('empresas').select('id, razao_social').eq('ativa', true).order('razao_social');
      return data ?? [];
    },
  });

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores-atestados', form.empresa_id],
    queryFn: async () => {
      if (!form.empresa_id) return [];
      const { data } = await supabase.from('colaboradores').select('id, nome_completo').eq('empresa_id', form.empresa_id).eq('status', 'ativo');
      return data ?? [];
    },
    enabled: !!form.empresa_id,
  });

  const { data: atestados = [] } = useQuery({
    queryKey: ['atestados', empresaFilter],
    queryFn: async () => {
      let q = supabase.from('atestados').select('*, colaboradores:colaborador_id(nome_completo), empresas:empresa_id(razao_social)').order('data_inicio', { ascending: false });
      if (empresaFilter) q = q.eq('empresa_id', empresaFilter);
      const { data } = await q.limit(100);
      return (data ?? []) as any[];
    },
  });

  const createAtestado = useMutation({
    mutationFn: async () => {
      const payload = { ...form, dias: parseInt(form.dias) || 1 };
      const { error } = await supabase.from('atestados').insert(payload as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atestados'] });
      toast({ title: 'Atestado registrado' });
      setShowNew(false);
      setForm({ empresa_id: '', colaborador_id: '', cid: '', dias: '1', data_inicio: '', data_fim: '', tipo: 'nao_ocupacional', observacoes: '' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  // Summary stats
  const totalDias = atestados.reduce((acc: number, a: any) => acc + (a.dias || 0), 0);
  const pendentes = atestados.filter((a: any) => a.status === 'pendente').length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Atestados e Absenteísmo</h1>
          <p className="text-muted-foreground">Registro e acompanhamento de afastamentos</p>
        </div>
        <Select value={empresaFilter} onValueChange={setEmpresaFilter}>
          <SelectTrigger className="w-60"><SelectValue placeholder="Filtrar empresa..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {empresas.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.razao_social}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{atestados.length}</p>
          <p className="text-sm text-muted-foreground">Atestados</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{totalDias}</p>
          <p className="text-sm text-muted-foreground">Dias Afastados</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{pendentes}</p>
          <p className="text-sm text-muted-foreground">Pendentes Validação</p>
        </CardContent></Card>
      </div>

      <div className="flex justify-end mb-4">
        <Dialog open={showNew} onOpenChange={setShowNew}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="h-4 w-4 mr-1" /> Novo Atestado
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Atestado</DialogTitle></DialogHeader>
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
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Dias</Label>
                  <Input type="number" value={form.dias} onChange={e => setForm(p => ({ ...p, dias: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Data Início</Label>
                  <Input type="date" value={form.data_inicio} onChange={e => setForm(p => ({ ...p, data_inicio: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Data Fim</Label>
                  <Input type="date" value={form.data_fim} onChange={e => setForm(p => ({ ...p, data_fim: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={form.tipo} onValueChange={v => setForm(p => ({ ...p, tipo: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ocupacional">Ocupacional</SelectItem>
                      <SelectItem value="nao_ocupacional">Não Ocupacional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>CID (opcional)</Label>
                  <Input value={form.cid} onChange={e => setForm(p => ({ ...p, cid: e.target.value }))} placeholder="Ex: M54" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea value={form.observacoes} onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))} />
              </div>
              <Button onClick={() => createAtestado.mutate()} disabled={!form.empresa_id || !form.colaborador_id || !form.data_inicio} className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Registrar
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
                <TableHead>Dias</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>CID</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {atestados.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum atestado registrado</TableCell></TableRow>
              ) : atestados.map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.colaboradores?.nome_completo}</TableCell>
                  <TableCell>{a.empresas?.razao_social}</TableCell>
                  <TableCell className="capitalize">{a.tipo?.replace('_', ' ')}</TableCell>
                  <TableCell>{a.dias}</TableCell>
                  <TableCell>{a.data_inicio} → {a.data_fim || '—'}</TableCell>
                  <TableCell>{a.cid || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={a.status === 'validado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                      {a.status}
                    </Badge>
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

export default AtestadosPage;
