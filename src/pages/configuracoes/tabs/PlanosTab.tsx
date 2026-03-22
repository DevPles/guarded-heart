import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const PlanosTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: planos, isLoading } = useQuery({
    queryKey: ['config-planos'],
    queryFn: async () => {
      const { data } = await supabase.from('planos').select('*').order('valor_mensal');
      return data ?? [];
    },
  });

  const { data: contratos } = useQuery({
    queryKey: ['config-contratos'],
    queryFn: async () => {
      const { data } = await supabase.from('contratos').select('*, empresas(razao_social), planos(nome)').order('created_at', { ascending: false });
      return data ?? [];
    },
  });

  if (showForm || editingId) {
    return <PlanoForm planoId={editingId} onClose={() => { setShowForm(false); setEditingId(null); }} onSaved={() => { setShowForm(false); setEditingId(null); queryClient.invalidateQueries({ queryKey: ['config-planos'] }); }} />;
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-semibold">Planos</h3>
          <span className="text-sm text-muted-foreground">{planos?.length ?? 0} planos</span>
          <Button onClick={() => setShowForm(true)} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground ml-auto whitespace-nowrap">
            Novo Plano
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Valor Mensal</TableHead>
              <TableHead>Limite Usuários</TableHead>
              <TableHead>Limite Colaboradores</TableHead>
              <TableHead>Limite Avaliações</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : planos?.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum plano</TableCell></TableRow>
            ) : planos?.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.nome}</TableCell>
                <TableCell>R$ {Number(p.valor_mensal).toFixed(2)}</TableCell>
                <TableCell>{p.limite_usuarios}</TableCell>
                <TableCell>{p.limite_colaboradores}</TableCell>
                <TableCell>{p.limite_avaliacoes}</TableCell>
                <TableCell><Badge variant={p.ativo ? 'default' : 'secondary'}>{p.ativo ? 'Ativo' : 'Inativo'}</Badge></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => setEditingId(p.id)}>Editar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Contratos Ativos</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Início</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contratos?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum contrato</TableCell></TableRow>
            ) : contratos?.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.empresas?.razao_social}</TableCell>
                <TableCell>{c.planos?.nome}</TableCell>
                <TableCell>R$ {Number(c.valor_mensal).toFixed(2)}</TableCell>
                <TableCell><Badge variant={c.status === 'ativo' ? 'default' : 'destructive'}>{c.status}</Badge></TableCell>
                <TableCell>{c.data_inicio}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const PlanoForm = ({ planoId, onClose, onSaved }: { planoId: string | null; onClose: () => void; onSaved: () => void }) => {
  const { toast } = useToast();
  const isEdit = !!planoId;
  const [form, setForm] = useState({
    nome: '', descricao: '', limite_usuarios: '5', limite_colaboradores: '50',
    limite_avaliacoes: '100', valor_mensal: '0', ativo: true,
  });

  const { data: existing } = useQuery({
    queryKey: ['plano-edit', planoId],
    queryFn: async () => {
      if (!planoId) return null;
      const { data } = await supabase.from('planos').select('*').eq('id', planoId).single();
      return data;
    },
    enabled: !!planoId,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        nome: existing.nome, descricao: existing.descricao || '',
        limite_usuarios: String(existing.limite_usuarios), limite_colaboradores: String(existing.limite_colaboradores),
        limite_avaliacoes: String(existing.limite_avaliacoes), valor_mensal: String(existing.valor_mensal),
        ativo: existing.ativo,
      });
    }
  }, [existing]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        nome: form.nome, descricao: form.descricao || null,
        limite_usuarios: parseInt(form.limite_usuarios), limite_colaboradores: parseInt(form.limite_colaboradores),
        limite_avaliacoes: parseInt(form.limite_avaliacoes), valor_mensal: parseFloat(form.valor_mensal),
        ativo: form.ativo,
      };
      if (isEdit) {
        const { error } = await supabase.from('planos').update(payload).eq('id', planoId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('planos').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast({ title: isEdit ? 'Plano atualizado' : 'Plano criado' }); onSaved(); },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
  });

  const set = (field: string, value: string | boolean) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
      <Card>
        <CardContent className="p-6 space-y-6">
          <h2 className="text-lg font-semibold">{isEdit ? 'Editar Plano' : 'Novo Plano'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Nome do Plano *</Label><Input value={form.nome} onChange={(e) => set('nome', e.target.value)} required placeholder="Ex: Profissional" /></div>
            <div className="space-y-2"><Label>Valor Mensal (R$)</Label><Input type="number" step="0.01" value={form.valor_mensal} onChange={(e) => set('valor_mensal', e.target.value)} /></div>
            <div className="space-y-2"><Label>Limite de Usuários</Label><Input type="number" value={form.limite_usuarios} onChange={(e) => set('limite_usuarios', e.target.value)} /></div>
            <div className="space-y-2"><Label>Limite de Colaboradores</Label><Input type="number" value={form.limite_colaboradores} onChange={(e) => set('limite_colaboradores', e.target.value)} /></div>
            <div className="space-y-2"><Label>Limite de Avaliações</Label><Input type="number" value={form.limite_avaliacoes} onChange={(e) => set('limite_avaliacoes', e.target.value)} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Descrição</Label><Input value={form.descricao} onChange={(e) => set('descricao', e.target.value)} /></div>
          </div>
          <Separator />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-full">Cancelar</Button>
            <Button type="submit" disabled={mutation.isPending} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
              {mutation.isPending ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar Plano'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default PlanosTab;
