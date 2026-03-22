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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';


interface Props {
  empresas: any[];
  programas: any[];
}

const PCMSOProgramas = ({ empresas, programas }: Props) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    empresa_id: '', responsavel_medico: '', crm: '', data_inicio: '', data_fim: '', observacoes: '',
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('pcmso_programas').insert(form as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pcmso-programas'] });
      toast({ title: 'Programa PCMSO criado' });
      setShowNew(false);
      setForm({ empresa_id: '', responsavel_medico: '', crm: '', data_inicio: '', data_fim: '', observacoes: '' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const statusColor = (status: string) => {
    if (status === 'ativo') return 'bg-green-100 text-green-700';
    if (status === 'encerrado') return 'bg-muted text-muted-foreground';
    return 'bg-amber-100 text-amber-700';
  };

  const isExpiringSoon = (dataFim: string | null) => {
    if (!dataFim) return false;
    const diff = (new Date(dataFim).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 60;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={showNew} onOpenChange={setShowNew}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Novo Programa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Programa PCMSO</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Empresa</Label>
                <Select value={form.empresa_id} onValueChange={v => setForm(p => ({ ...p, empresa_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{empresas.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.razao_social}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Médico Responsável</Label>
                  <Input value={form.responsavel_medico} onChange={e => setForm(p => ({ ...p, responsavel_medico: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>CRM</Label>
                  <Input value={form.crm} onChange={e => setForm(p => ({ ...p, crm: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Início</Label>
                  <Input type="date" value={form.data_inicio} onChange={e => setForm(p => ({ ...p, data_inicio: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Data Fim</Label>
                  <Input type="date" value={form.data_fim} onChange={e => setForm(p => ({ ...p, data_fim: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea value={form.observacoes} onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))} />
              </div>
              <Button onClick={() => create.mutate()} disabled={!form.empresa_id || !form.data_inicio} className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
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
                <TableHead>Versão</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programas.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum programa cadastrado</TableCell></TableRow>
              ) : programas.map((p: any) => (
                <TableRow key={p.id} className={isExpiringSoon(p.data_fim) ? 'bg-amber-50 dark:bg-amber-950/20' : ''}>
                  <TableCell className="font-medium">{p.empresas?.razao_social}</TableCell>
                  <TableCell>{p.responsavel_medico || '—'}</TableCell>
                  <TableCell>{p.crm || '—'}</TableCell>
                  <TableCell>
                    {p.data_inicio} → {p.data_fim || '∞'}
                    {isExpiringSoon(p.data_fim) && <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-700 text-xs">Vencendo</Badge>}
                  </TableCell>
                  <TableCell>v{p.versao}</TableCell>
                  <TableCell><Badge variant="outline" className={statusColor(p.status)}>{p.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PCMSOProgramas;
