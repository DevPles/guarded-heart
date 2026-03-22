
-- Notification status enum
CREATE TYPE public.notification_status AS ENUM ('pending', 'viewed', 'resolved');

-- Notification priority enum
CREATE TYPE public.notification_priority AS ENUM ('info', 'warning', 'critical');

-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL,
  company_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  entity_id UUID,
  entity_type TEXT,
  priority public.notification_priority NOT NULL DEFAULT 'info',
  status public.notification_status NOT NULL DEFAULT 'pending',
  action_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Notification rules table (configurable alert rules)
CREATE TABLE public.notification_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  days_before INTEGER[] NOT NULL DEFAULT '{30,15,7}',
  priority public.notification_priority NOT NULL DEFAULT 'warning',
  repeat_after_days INTEGER DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notification logs for audit
CREATE TABLE public.notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin_master'));

CREATE POLICY "System insert notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin_master'));

-- RLS on notification_rules
ALTER TABLE public.notification_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read notification_rules"
  ON public.notification_rules FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Manage notification_rules"
  ON public.notification_rules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin_master'));

-- RLS on notification_logs
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read notification_logs"
  ON public.notification_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin_master'));

CREATE POLICY "Insert notification_logs"
  ON public.notification_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Indexes
CREATE INDEX idx_notifications_user_status ON public.notifications(user_id, status);
CREATE INDEX idx_notifications_company ON public.notifications(company_id);
CREATE INDEX idx_notification_rules_company ON public.notification_rules(company_id, type);
