Module: Notification & Alert System - tables, edge function, bell UI, config tab

## DB Tables
- notifications (type, title, description, user_id, company_id, entity_id, entity_type, priority, status, action_link)
- notification_rules (company_id, type, enabled, days_before[], priority, repeat_after_days)
- notification_logs (notification_id, action, performed_by, metadata)
- Enums: notification_status (pending/viewed/resolved), notification_priority (info/warning/critical)
- Realtime enabled on notifications table

## Edge Function
- supabase/functions/notification-engine/index.ts
- Actions: 'run-cron' (scans plans, assessments, checklists, contracts) and 'emit' (event-based)
- Checks: PLANO_ACAO_VENCIDO, AEP/AET_VENCIMENTO, CHECKLIST_PENDENTE, RISCO_CRITICO, CONTRATO_VENCIMENTO

## UI
- NotificationBell component in TopNav (realtime subscription)
- /notificacoes page with filters (status, priority)
- Config tab in ConfiguracoesPage > "Notificações" for managing rules

## Hook
- useNotifications: query + realtime + markAsRead/markAsResolved/markAllAsRead
