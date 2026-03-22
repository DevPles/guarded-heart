import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'run-cron';

    if (action === 'emit') {
      // Event-based notification
      const { type, title, description, user_id, company_id, entity_id, entity_type, priority, action_link } = body;
      if (!type || !title || !user_id) {
        return new Response(JSON.stringify({ error: 'Missing required fields: type, title, user_id' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabase.from('notifications').insert({
        type, title, description: description || null,
        user_id, company_id: company_id || null,
        entity_id: entity_id || null, entity_type: entity_type || null,
        priority: priority || 'info', action_link: action_link || null,
      }).select().single();

      if (error) throw error;

      // Log
      await supabase.from('notification_logs').insert({
        notification_id: data.id, action: 'created',
        performed_by: user_id, metadata: { source: 'emit', type },
      });

      return new Response(JSON.stringify({ success: true, notification: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'run-cron') {
      const created: string[] = [];

      // 1. Check action plans due/overdue
      const { data: plans } = await supabase
        .from('action_plans')
        .select('id, action, due_date, responsible, empresa_id, status')
        .in('status', ['pendente', 'em_andamento'])
        .not('due_date', 'is', null);

      const today = new Date();

      for (const plan of plans || []) {
        const dueDate = new Date(plan.due_date!);
        const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Get rules for this type
        const { data: rules } = await supabase
          .from('notification_rules')
          .select('*')
          .eq('type', 'PLANO_ACAO_VENCIDO')
          .eq('enabled', true);

        const rule = rules?.[0];
        const alertDays = rule?.days_before || [30, 15, 7];
        const priority = diffDays < 0 ? 'critical' : diffDays <= 7 ? 'warning' : 'info';

        const shouldAlert = diffDays < 0 || alertDays.includes(diffDays);
        if (!shouldAlert) continue;

        // Check if notification already exists for today
        const todayStr = today.toISOString().split('T')[0];
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('entity_id', plan.id)
          .eq('type', 'PLANO_ACAO_VENCIDO')
          .gte('created_at', todayStr);

        if (existing && existing.length > 0) continue;

        // Find users to notify (empresa admins/gestors + consultors)
        const { data: companyUsers } = await supabase
          .from('profiles')
          .select('id')
          .eq('empresa_id', plan.empresa_id);

        for (const u of companyUsers || []) {
          const title = diffDays < 0
            ? `Plano de ação VENCIDO há ${Math.abs(diffDays)} dias`
            : `Plano de ação vence em ${diffDays} dias`;

          await supabase.from('notifications').insert({
            type: 'PLANO_ACAO_VENCIDO',
            title,
            description: plan.action.substring(0, 200),
            user_id: u.id,
            company_id: plan.empresa_id,
            entity_id: plan.id,
            entity_type: 'action_plan',
            priority,
            action_link: '/planos-acao',
          });
          created.push(plan.id);
        }
      }

      // 2. Check assessments needing re-evaluation (finalized > 12 months ago)
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      
      const { data: oldAssessments } = await supabase
        .from('assessments')
        .select('id, title, type, empresa_id, finalized_at')
        .eq('status', 'finalizado')
        .lt('finalized_at', twelveMonthsAgo.toISOString());

      for (const assessment of oldAssessments || []) {
        const todayStr = today.toISOString().split('T')[0];
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('entity_id', assessment.id)
          .eq('type', `${assessment.type.toUpperCase()}_VENCIMENTO`)
          .gte('created_at', todayStr);

        if (existing && existing.length > 0) continue;

        const { data: companyUsers } = await supabase
          .from('profiles')
          .select('id')
          .eq('empresa_id', assessment.empresa_id);

        for (const u of companyUsers || []) {
          await supabase.from('notifications').insert({
            type: `${assessment.type.toUpperCase()}_VENCIMENTO`,
            title: `${assessment.type.toUpperCase()} necessita reavaliação`,
            description: `"${assessment.title}" foi finalizada há mais de 12 meses.`,
            user_id: u.id,
            company_id: assessment.empresa_id,
            entity_id: assessment.id,
            entity_type: 'assessment',
            priority: 'warning',
            action_link: `/${assessment.type}`,
          });
          created.push(assessment.id);
        }
      }

      // 3. Check missing checklists for current month
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();

      if (today.getDate() >= 15) {
        const { data: allColaboradores } = await supabase
          .from('colaboradores')
          .select('id, nome_completo, empresa_id, user_id')
          .eq('status', 'ativo');

        const { data: existingChecklists } = await supabase
          .from('checklists')
          .select('colaborador_id')
          .eq('month', currentMonth)
          .eq('year', currentYear);

        const completedIds = new Set((existingChecklists || []).map(c => c.colaborador_id));

        for (const col of allColaboradores || []) {
          if (completedIds.has(col.id)) continue;
          if (!col.user_id) continue;

          const todayStr = today.toISOString().split('T')[0];
          const { data: existing } = await supabase
            .from('notifications')
            .select('id')
            .eq('entity_id', col.id)
            .eq('type', 'CHECKLIST_PENDENTE')
            .gte('created_at', todayStr);

          if (existing && existing.length > 0) continue;

          await supabase.from('notifications').insert({
            type: 'CHECKLIST_PENDENTE',
            title: 'Checklist mensal pendente',
            description: `O checklist de ${currentMonth}/${currentYear} ainda não foi preenchido.`,
            user_id: col.user_id,
            company_id: col.empresa_id,
            entity_id: col.id,
            entity_type: 'colaborador',
            priority: 'warning',
            action_link: '/checklists',
          });
          created.push(col.id);
        }
      }

      // 4. Check critical risk assessments
      const { data: criticalAssessments } = await supabase
        .from('assessments')
        .select('id, title, empresa_id, risk_classification')
        .eq('risk_classification', 'critico')
        .eq('status', 'finalizado');

      for (const ca of criticalAssessments || []) {
        const { data: existingPlans } = await supabase
          .from('action_plans')
          .select('id')
          .eq('assessment_id', ca.id)
          .in('status', ['pendente', 'em_andamento']);

        if (existingPlans && existingPlans.length > 0) continue;

        const todayStr = today.toISOString().split('T')[0];
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('entity_id', ca.id)
          .eq('type', 'RISCO_CRITICO')
          .gte('created_at', todayStr);

        if (existing && existing.length > 0) continue;

        const { data: companyUsers } = await supabase
          .from('profiles')
          .select('id')
          .eq('empresa_id', ca.empresa_id);

        for (const u of companyUsers || []) {
          await supabase.from('notifications').insert({
            type: 'RISCO_CRITICO',
            title: 'Risco CRÍTICO sem plano de ação ativo',
            description: `"${ca.title}" possui classificação crítica sem plano de ação em andamento.`,
            user_id: u.id,
            company_id: ca.empresa_id,
            entity_id: ca.id,
            entity_type: 'assessment',
            priority: 'critical',
            action_link: '/planos-acao',
          });
          created.push(ca.id);
        }
      }

      // 5. Check contract expiration
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { data: expiringContracts } = await supabase
        .from('contratos')
        .select('id, empresa_id, data_fim, status')
        .eq('status', 'ativo')
        .not('data_fim', 'is', null)
        .lte('data_fim', thirtyDaysFromNow.toISOString().split('T')[0]);

      for (const contract of expiringContracts || []) {
        const endDate = new Date(contract.data_fim!);
        const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        const todayStr = today.toISOString().split('T')[0];
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('entity_id', contract.id)
          .eq('type', 'CONTRATO_VENCIMENTO')
          .gte('created_at', todayStr);

        if (existing && existing.length > 0) continue;

        // Notify admin users
        const { data: adminRoles } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin_master');

        for (const ar of adminRoles || []) {
          await supabase.from('notifications').insert({
            type: 'CONTRATO_VENCIMENTO',
            title: diffDays < 0 ? 'Contrato VENCIDO' : `Contrato vence em ${diffDays} dias`,
            description: `Contrato da empresa expira em ${endDate.toLocaleDateString('pt-BR')}.`,
            user_id: ar.user_id,
            company_id: contract.empresa_id,
            entity_id: contract.id,
            entity_type: 'contrato',
            priority: diffDays < 0 ? 'critical' : diffDays <= 7 ? 'warning' : 'info',
            action_link: '/configuracoes',
          });
          created.push(contract.id);
        }
      }

      // 6. Check PCMSO exams overdue
      const { data: pendingExams } = await supabase
        .from('pcmso_eventos')
        .select('id, colaborador_id, empresa_id, tipo, data_prevista, colaboradores:colaborador_id(nome_completo, user_id)')
        .is('data_realizada', null)
        .not('data_prevista', 'is', null);

      for (const exam of pendingExams || []) {
        const examDate = new Date(exam.data_prevista);
        const diffDays = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const shouldAlert = diffDays <= 30;
        if (!shouldAlert) continue;

        const todayStr = today.toISOString().split('T')[0];
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('entity_id', exam.id)
          .eq('type', 'EXAME_VENCIMENTO')
          .gte('created_at', todayStr);
        if (existing && existing.length > 0) continue;

        const colUser = (exam.colaboradores as any);
        const targetUserId = colUser?.user_id;
        if (!targetUserId) continue;

        await supabase.from('notifications').insert({
          type: 'EXAME_VENCIMENTO',
          title: diffDays < 0 ? `Exame ${exam.tipo} VENCIDO` : `Exame ${exam.tipo} em ${diffDays} dias`,
          description: `Colaborador: ${colUser?.nome_completo}`,
          user_id: targetUserId,
          company_id: exam.empresa_id,
          entity_id: exam.id,
          entity_type: 'pcmso_evento',
          priority: diffDays < 0 ? 'critical' : diffDays <= 7 ? 'warning' : 'info',
          action_link: '/pcmso',
        });
        created.push(exam.id);
      }

      // 7. Check documents expiring
      const thirtyDaysDoc = new Date();
      thirtyDaysDoc.setDate(thirtyDaysDoc.getDate() + 30);
      
      const { data: expiringDocs } = await supabase
        .from('documents')
        .select('id, titulo, tipo_documento, empresa_id, proximo_vencimento')
        .eq('status', 'vigente')
        .not('proximo_vencimento', 'is', null)
        .lte('proximo_vencimento', thirtyDaysDoc.toISOString().split('T')[0]);

      for (const doc of expiringDocs || []) {
        const docDate = new Date(doc.proximo_vencimento);
        const diffDays = Math.ceil((docDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        const todayStr = today.toISOString().split('T')[0];
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('entity_id', doc.id)
          .eq('type', 'DOCUMENTO_VENCIMENTO')
          .gte('created_at', todayStr);
        if (existing && existing.length > 0) continue;

        const { data: companyUsers } = await supabase
          .from('profiles')
          .select('id')
          .eq('empresa_id', doc.empresa_id);

        for (const u of companyUsers || []) {
          await supabase.from('notifications').insert({
            type: 'DOCUMENTO_VENCIMENTO',
            title: diffDays < 0 ? `${doc.tipo_documento} "${doc.titulo}" VENCIDO` : `${doc.tipo_documento} vence em ${diffDays} dias`,
            description: doc.titulo,
            user_id: u.id,
            company_id: doc.empresa_id,
            entity_id: doc.id,
            entity_type: 'document',
            priority: diffDays < 0 ? 'critical' : diffDays <= 7 ? 'warning' : 'info',
            action_link: '/documentos',
          });
          created.push(doc.id);
        }
      }

      return new Response(JSON.stringify({ success: true, notifications_created: created.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
