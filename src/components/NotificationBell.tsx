import { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const priorityConfig = {
  info: { icon: Info, className: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  warning: { icon: AlertTriangle, className: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  critical: { icon: AlertCircle, className: 'text-destructive', bg: 'bg-red-50 dark:bg-red-950/30' },
};

const NotificationItem = ({ notification, onRead, onNavigate }: {
  notification: Notification;
  onRead: (id: string) => void;
  onNavigate: (link: string) => void;
}) => {
  const config = priorityConfig[notification.priority];
  const Icon = config.icon;
  const isPending = notification.status === 'pending';

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 border-b last:border-b-0 transition-colors cursor-pointer hover:bg-muted/50',
        isPending && config.bg
      )}
      onClick={() => {
        if (isPending) onRead(notification.id);
        if (notification.action_link) onNavigate(notification.action_link);
      }}
    >
      <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', config.className)} />
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm', isPending ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
          {notification.title}
        </p>
        {notification.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.description}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(notification.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isPending && (
        <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
      )}
    </div>
  );
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(!open)}
        aria-label="Notificações"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-[10px] bg-destructive text-destructive-foreground border-2 border-card">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-semibold text-sm">Notificações</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={() => markAllAsRead.mutate()}
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" /> Marcar todas
              </Button>
            )}
          </div>

          <ScrollArea className="max-h-[400px]">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Nenhuma notificação
              </div>
            ) : (
              notifications.map(n => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={(id) => markAsRead.mutate(id)}
                  onNavigate={(link) => { setOpen(false); navigate(link); }}
                />
              ))
            )}
          </ScrollArea>

          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => { setOpen(false); navigate('/notificacoes'); }}
            >
              Ver todas as notificações
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
