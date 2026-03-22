import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Bell, Plus } from 'lucide-react';

const NOTIFICATION_TYPES = [
  { value: 'EXAME_VENCIMENTO', label: 'Vencimento de Exames' },
  { value: 'CHECKLIST_PENDENTE', label: 'Checklist Pendente' },
  { value: 'PLANO_ACAO_VENCIDO', label: 'Plano de Ação Vencido' },
  { value: 'RISCO_CRITICO', label: 'Risco Crítico Detectado' },
  { value: 'AEP_VENCIMENTO', label: 'AEP - Reavaliação' },
  { value: 'AET_VENCIMENTO', label: 'AET - Reavaliação' },
  { value: 'CONTRATO_VENCIMENTO', label: 'Contrato Próximo do Vencimento' },
];

const NotificacoesConfigTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rules = [] } = useQuery({
    queryKey: ['notification-rules'],
    queryFn: async () => {
      const { data } = await supabase.from('notification_rules').select('*').order('type');
      return (data ?? []) as any[];
    },
  });

  const [newType, setNewType] = useState('');
  const [newDays, setNewDays] = useState('30,15,7');
  const [newPriority, setNewPriority] = useState('warning');

  const addRule = useMutation({
    mutationFn: async () => {
      const days = newDays.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
      const { error } = await supabase.from('notification_rules').insert({
        type: newType,
        days_before: days,
        priority: newPriority as any,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-rules'] });
      toast({ title: 'Regra criada', description: 'Nova regra de notificação adicionada.' });
      setNewType('');
    },
    onError: () => toast({ title: 'Erro', description: 'Não foi possível criar a regra.', variant: 'destructive' }),
  });

  const toggleRule = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase.from('notification_rules').update({ enabled } as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notification-rules'] }),
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notification_rules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-rules'] });
      toast({ title: 'Regra removida' });
    },
  });

  const typeLabel = (type: string) => NOTIFICATION_TYPES.find(t => t.value === type)?.label || type;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Regras de Notificação</h3>
          </div>
          <p className="text-sm text-muted-foreground">Configure quais alertas devem ser gerados automaticamente e com qual antecedência.</p>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>Tipo de Alerta</Label>
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {NOTIFICATION_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Dias de Antecedência</Label>
              <Input value={newDays} onChange={e => setNewDays(e.target.value)} placeholder="30,15,7" />
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={newPriority} onValueChange={setNewPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Informativo</SelectItem>
                  <SelectItem value="warning">Atenção</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => addRule.mutate()}
              disabled={!newType}
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-1" /> Adicionar
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Antecedência (dias)</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-4 text-muted-foreground">Nenhuma regra configurada</TableCell></TableRow>
              ) : rules.map((rule: any) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{typeLabel(rule.type)}</TableCell>
                  <TableCell>{(rule.days_before || []).join(', ')}</TableCell>
                  <TableCell className="capitalize">{rule.priority === 'info' ? 'Informativo' : rule.priority === 'warning' ? 'Atenção' : 'Crítico'}</TableCell>
                  <TableCell>
                    <Switch checked={rule.enabled} onCheckedChange={(enabled) => toggleRule.mutate({ id: rule.id, enabled })} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteRule.mutate(rule.id)}>Remover</Button>
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

export default NotificacoesConfigTab;
