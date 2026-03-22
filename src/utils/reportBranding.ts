import { supabase } from '@/integrations/supabase/client';

export async function fetchCompanyLogoUrl(empresaId?: string | null): Promise<string | undefined> {
  if (!empresaId) return undefined;

  const { data, error } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('empresa_id', empresaId)
    .not('avatar_url', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return undefined;
  return data?.avatar_url || undefined;
}

export async function fetchEvaluatorLabel(evaluatorId?: string | null, fallback = ''): Promise<string> {
  if (!evaluatorId) return fallback;

  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', evaluatorId)
    .maybeSingle();

  if (error) return fallback;
  return data?.full_name || data?.email || fallback;
}