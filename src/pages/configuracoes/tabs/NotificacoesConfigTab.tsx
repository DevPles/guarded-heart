import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const NOTIFICATION_TYPES = [
  { value: 'EXAME_VENCIMENTO', label: 'Vencimento de Exames' },
  { value: 'CHECKLIST_PENDENTE', label: 'Checklist Pendente' },
  { value: 'PLANO_ACAO_VENCIDO', label: 'Plano de Ação Vencido' },
  { value: 'RISCO_CRITICO', label: 'Risco Crítico Detectado' },
  { value: 'AEP_VENCIMENTO', label: 'AEP - Reavaliação' },
  { value: 'AET_VENCIMENTO', label: 'AET - Reavaliação' },
  { value: 'CONTRATO_VENCIMENTO', label: 'Contrato Próximo do Vencimento' },
];

const priorityConfig = {
  info: { label: 'Informativo', badgeClass: 'bg-blue-100 text-blue-700' },
  warning: { label: 'Atenção', badgeClass: 'bg-amber-100 text-amber-700' },
  critical: { label: 'Crítico', badgeClass: 'bg-red-100 text-red-700' },
};

const statusLabels: Record<string, string> = { pending: 'Pendente', viewed: 'Lida', resolved: 'Resolvida' };

const NotificacoesConfigTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // --- Notification rules ---
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

  // --- Notifications list ---
  const { notifications, unreadCount, markAsRead, markAsResolved, markAllAsRead } = useNotifications();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const filtered = notifications.filter(n => {
    if (filterStatus !== 'all' && n.status !== filterStatus) return false;
    if (filterPriority !== 'all' && n.priority !== filterPriority) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="central">
        <TabsList>
          <TabsTrigger value="central">Central de Notificações</TabsTrigger>
          <TabsTrigger value="regras">Regras de Notificação</TabsTrigger>
        </TabsList>

        {/* --- Central de Notificações --- */}
        <TabsContent value="central" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{unreadCount} não lidas</p>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => markAllAsRead.mutate()}>
                Marcar todas como lidas
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="viewed">Lidas</SelectItem>
                <SelectItem value="resolved">Resolvidas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Prioridade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="info">Informativo</SelectItem>
                <SelectItem value="warning">Atenção</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {filtered.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhuma notificação encontrada</CardContent></Card>
            ) : filtered.map(n => {
              const config = priorityConfig[n.priority];
              const isPending = n.status === 'pending';
              return (
                <Card key={n.id} className={cn(isPending && 'border-l-4', isPending && n.priority === 'critical' && 'border-l-destructive', isPending && n.priority === 'warning' && 'border-l-amber-500', isPending && n.priority === 'info' && 'border-l-blue-500')}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={cn('text-sm', isPending ? 'font-semibold' : 'text-muted-foreground')}>{n.title}</p>
                        <Badge variant="outline" className={cn('text-[10px]', config.badgeClass)}>{config.label}</Badge>
                        <Badge variant="outline" className="text-[10px]">{statusLabels[n.status]}</Badge>
                      </div>
                      {n.description && <p className="text-sm text-muted-foreground">{n.description}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {isPending && (
                        <Button variant="ghost" size="sm" className="rounded-full" onClick={() => markAsRead.mutate(n.id)}>Marcar lida</Button>
                      )}
                      {n.status !== 'resolved' && (
                        <Button variant="ghost" size="sm" className="rounded-full" onClick={() => markAsResolved.mutate(n.id)}>Resolver</Button>
                      )}
                      {n.action_link && (
                        <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigate(n.action_link!)}>Ver</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* --- Regras de Notificação --- */}
        <TabsContent value="regras" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Regras de Notificação</h3>
                <p className="text-sm text-muted-foreground">Configure quais alertas devem ser gerados automaticamente e com qual antecedência.</p>
              </div>

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
                  Adicionar
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
                        <Button variant="ghost" size="sm" className="text-destructive rounded-full" onClick={() => deleteRule.mutate(rule.id)}>Remover</Button>
                      </TableCell>
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

export default NotificacoesConfigTab;
