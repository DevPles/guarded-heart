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
import { generatePcmsoPdf } from '@/utils/pcmsoPdfReport';

interface Props {
  empresas: any[];
  programas: any[];
  eventos?: any[];
}

const PCMSOProgramas = ({ empresas, programas, eventos = [] }: Props) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [editingPrograma, setEditingPrograma] = useState<any>(null);
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);
  const [form, setForm] = useState({
    empresa_id: '', responsavel_medico: '', crm: '', data_inicio: '', data_fim: '', observacoes: '', status: 'ativo',
  });

  const resetForm = () => setForm({ empresa_id: '', responsavel_medico: '', crm: '', data_inicio: '', data_fim: '', observacoes: '', status: 'ativo' });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('pcmso_programas').insert(form as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pcmso-programas'] });
      toast({ title: 'Programa PCMSO criado' });
      setShowNew(false);
      resetForm();
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const update = useMutation({
    mutationFn: async () => {
      if (!editingPrograma) return;
      const { error } = await supabase.from('pcmso_programas').update({
        responsavel_medico: form.responsavel_medico,
        crm: form.crm,
        data_inicio: form.data_inicio,
        data_fim: form.data_fim || null,
        observacoes: form.observacoes || null,
        status: form.status,
      }).eq('id', editingPrograma.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pcmso-programas'] });
      toast({ title: 'Programa atualizado' });
      setEditingPrograma(null);
      resetForm();
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const openEdit = (p: any) => {
    setForm({
      empresa_id: p.empresa_id,
      responsavel_medico: p.responsavel_medico || '',
      crm: p.crm || '',
      data_inicio: p.data_inicio || '',
      data_fim: p.data_fim || '',
      observacoes: p.observacoes || '',
      status: p.status || 'ativo',
    });
    setEditingPrograma(p);
  };

  const handleGeneratePdf = async (programa: any) => {
    setGeneratingPdf(programa.id);
    try {
      const programaEventos = eventos.filter(e => e.programa_id === programa.id || e.empresa_id === programa.empresa_id);
      await generatePcmsoPdf({
        programa,
        empresa: empresas.find(e => e.id === programa.empresa_id),
        eventos: programaEventos,
      });
      toast({ title: 'Relatório PDF gerado com sucesso' });
    } catch (err: any) {
      toast({ title: 'Erro ao gerar PDF', description: err.message, variant: 'destructive' });
    }
    setGeneratingPdf(null);
  };

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

  const formFields = (isEdit: boolean) => (
    <div className="space-y-4">
      {!isEdit && (
        <div className="space-y-2">
          <Label>Empresa</Label>
          <Select value={form.empresa_id} onValueChange={v => setForm(p => ({ ...p, empresa_id: v }))}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>{empresas.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.razao_social}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}
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
      {isEdit && (
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="encerrado">Encerrado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-2">
        <Label>Observações</Label>
        <Textarea value={form.observacoes} onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))} />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={showNew} onOpenChange={setShowNew}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">Novo Programa</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Programa PCMSO</DialogTitle></DialogHeader>
            {formFields(false)}
            <Button onClick={() => create.mutate()} disabled={!form.empresa_id || !form.data_inicio} className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Criar Programa
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingPrograma} onOpenChange={open => { if (!open) { setEditingPrograma(null); resetForm(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Editar Programa PCMSO</DialogTitle></DialogHeader>
          {editingPrograma && (
            <div className="text-sm text-muted-foreground mb-2">
              Empresa: <span className="font-medium text-foreground">{editingPrograma.empresas?.razao_social}</span> • Versão: v{editingPrograma.versao}
            </div>
          )}
          {formFields(true)}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { setEditingPrograma(null); resetForm(); }}>Cancelar</Button>
            <Button className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => update.mutate()}>Salvar Alterações</Button>
          </div>
        </DialogContent>
      </Dialog>

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
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programas.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum programa cadastrado</TableCell></TableRow>
              ) : programas.map((p: any) => (
                <TableRow key={p.id} className={`cursor-pointer hover:bg-muted/50 ${isExpiringSoon(p.data_fim) ? 'bg-amber-50 dark:bg-amber-950/20' : ''}`} onClick={() => openEdit(p)}>
                  <TableCell className="font-medium">{p.empresas?.razao_social}</TableCell>
                  <TableCell>{p.responsavel_medico || '—'}</TableCell>
                  <TableCell>{p.crm || '—'}</TableCell>
                  <TableCell>
                    {p.data_inicio} → {p.data_fim || '∞'}
                    {isExpiringSoon(p.data_fim) && <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-700 text-xs">Vencendo</Badge>}
                  </TableCell>
                  <TableCell>v{p.versao}</TableCell>
                  <TableCell><Badge variant="outline" className={statusColor(p.status)}>{p.status}</Badge></TableCell>
                  <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                    <Button variant="outline" size="sm" disabled={generatingPdf === p.id} onClick={() => handleGeneratePdf(p)}>
                      {generatingPdf === p.id ? 'Gerando...' : 'PDF'}
                    </Button>
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

export default PCMSOProgramas;
