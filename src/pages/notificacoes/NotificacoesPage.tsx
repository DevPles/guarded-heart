import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCheck, AlertTriangle, Info, AlertCircle, Filter } from 'lucide-react';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const priorityConfig = {
  info: { icon: Info, label: 'Informativo', className: 'text-blue-500', badgeClass: 'bg-blue-100 text-blue-700' },
  warning: { icon: AlertTriangle, label: 'Atenção', className: 'text-amber-500', badgeClass: 'bg-amber-100 text-amber-700' },
  critical: { icon: AlertCircle, label: 'Crítico', className: 'text-destructive', badgeClass: 'bg-red-100 text-red-700' },
};

const statusLabels = { pending: 'Pendente', viewed: 'Lida', resolved: 'Resolvida' };

const NotificacoesPage = () => {
  const { notifications, unreadCount, markAsRead, markAsResolved, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const filtered = notifications.filter(n => {
    if (filterStatus !== 'all' && n.status !== filterStatus) return false;
    if (filterPriority !== 'all' && n.priority !== filterPriority) return false;
    return true;
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notificações</h1>
          <p className="text-muted-foreground">{unreadCount} não lidas</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => markAllAsRead.mutate()}>
            <CheckCheck className="h-4 w-4 mr-2" /> Marcar todas como lidas
          </Button>
        )}
      </div>

      <div className="flex gap-3 mb-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Status" /></SelectTrigger>
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
          const Icon = config.icon;
          const isPending = n.status === 'pending';

          return (
            <Card key={n.id} className={cn(isPending && 'border-l-4', isPending && n.priority === 'critical' && 'border-l-destructive', isPending && n.priority === 'warning' && 'border-l-amber-500', isPending && n.priority === 'info' && 'border-l-blue-500')}>
              <CardContent className="p-4 flex items-start gap-4">
                <Icon className={cn('h-5 w-5 mt-1 shrink-0', config.className)} />
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
                    <Button variant="ghost" size="sm" onClick={() => markAsRead.mutate(n.id)}>Marcar lida</Button>
                  )}
                  {n.status !== 'resolved' && (
                    <Button variant="ghost" size="sm" onClick={() => markAsResolved.mutate(n.id)}>Resolver</Button>
                  )}
                  {n.action_link && (
                    <Button variant="outline" size="sm" onClick={() => navigate(n.action_link!)}>Ver</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default NotificacoesPage;
