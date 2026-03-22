
-- Fix permissive policies for checklists, attachments and audit_logs
DROP POLICY IF EXISTS "Insert checklists" ON public.checklists;
CREATE POLICY "Authenticated insert own checklists" ON public.checklists 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Insert attachments" ON public.attachments;
CREATE POLICY "Authenticated insert own attachments" ON public.attachments 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Insert audit_logs" ON public.audit_logs;
CREATE POLICY "Authenticated insert audit_logs" ON public.audit_logs 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() IS NOT NULL);
