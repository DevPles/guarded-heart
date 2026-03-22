import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const statusLabel: Record<string, string> = { pendente: 'Pendente', em_andamento: 'Em andamento', concluido: 'Concluído', vencido: 'Vencido' };
const statusVariant = (s: string) => {
  if (s === 'concluido') return 'default' as const;
  if (s === 'vencido') return 'destructive' as const;
  return 'secondary' as const;
};

const PlanosAcaoList = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['action-plans', search],
    queryFn: async () => {
      let query = supabase.from('action_plans').select('*, empresas(razao_social)').order('created_at', { ascending: false });
      if (search) query = query.ilike('action', `%${search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('action_plans').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action-plans'] });
      toast({ title: 'Plano removido' });
    },
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Planos de Ação</h1>
          <p className="text-muted-foreground">Gestão de ações corretivas e preventivas</p>
        </div>
        <div className="flex items-center gap-3">
          <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-[220px]" />
          <span className="text-sm text-muted-foreground whitespace-nowrap">{plans?.length ?? 0} registros</span>
          <Button onClick={() => navigate('/planos-acao/novo')}>Novo Plano</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ação</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : plans?.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum plano de ação cadastrado</TableCell></TableRow>
              ) : (
                plans?.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium max-w-xs truncate">{p.action}</TableCell>
                    <TableCell>{(p.empresas as any)?.razao_social || '—'}</TableCell>
                    <TableCell><Badge variant="outline">{p.priority}</Badge></TableCell>
                    <TableCell>{p.responsible || '—'}</TableCell>
                    <TableCell>{p.due_date ? format(new Date(p.due_date), 'dd/MM/yyyy') : '—'}</TableCell>
                    <TableCell><Badge variant={statusVariant(p.status)}>{statusLabel[p.status] || p.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteMutation.mutate(p.id)}>Excluir</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanosAcaoList;
