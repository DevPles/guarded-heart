import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileDown } from 'lucide-react';
import { generateArpPdf, ArpReportData } from '@/utils/arpPdfReport';
import { fetchCompanyLogoUrl, fetchEvaluatorLabel } from '@/utils/reportBranding';

const ARP_QUESTIONS = [
  'Baixa clareza de papel/função',
  'Falta de suporte/apoio da liderança',
  'Falta de suporte/apoio da equipe',
  'Baixo reconhecimento / recompensas desproporcionais',
  'Pressão excessiva por metas',
  'Excesso de demanda / sobrecarga',
  'Baixa autonomia sobre o próprio trabalho',
  'Comunicação falha ou insuficiente',
  'Conflito interpessoal recorrente',
  'Indícios de assédio moral',
  'Ameaça ou violência (qualquer natureza)',
  'Isolamento (inclui trabalho remoto)',
  'Sobrecarga emocional',
  'Má gestão de mudanças organizacionais',
];

const SCORE_LABELS = ['0 — Adequado', '1 — Leve', '2 — Moderado', '3 — Alto'];

const ARPForm = () => {
  const { id } = useParams();
  const isEdit = !!id && id !== 'nova';
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [setorId, setSetorId] = useState('');
  const [description, setDescription] = useState('');
  const [values, setValues] = useState<Record<number, number>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);

  const { data: empresas } = useQuery({
    queryKey: ['empresas-select'],
    queryFn: async () => {
      const { data } = await supabase.from('empresas').select('id, razao_social').order('razao_social');
      return data || [];
    },
  });

  const { data: setores } = useQuery({
    queryKey: ['setores-select', empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      const { data } = await supabase.from('setores').select('id, nome').eq('empresa_id', empresaId);
      return data || [];
    },
    enabled: !!empresaId,
  });

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      const { data } = await supabase.from('assessments').select('*').eq('id', id).single();
      if (data) {
        setTitle(data.title || '');
        setEmpresaId(data.empresa_id);
        setSetorId(data.setor_id || '');
        setDescription(data.description || '');
      }
      const { data: items } = await supabase.from('assessment_items').select('*').eq('assessment_id', id);
      if (items) {
        const v: Record<number, number> = {};
        const c: Record<number, string> = {};
        items.forEach((item) => { v[item.question_number] = item.value ?? 0; c[item.question_number] = item.comment || ''; });
        setValues(v);
        setComments(c);
      }
    };
    load();
  }, [id, isEdit]);

  const { totalScore, classification } = useMemo(() => {
    const vals = ARP_QUESTIONS.map((_, i) => values[i] ?? 0);
    const avg = vals.reduce((a, b) => a + b, 0) / ARP_QUESTIONS.length;
    const score = Math.round((avg / 3) * 100 * 100) / 100;
    const classification = score <= 33 ? 'baixo' : score <= 66 ? 'moderado' : 'alto';
    return { totalScore: score, classification };
  }, [values]);

  const hasCritical = Object.entries(values).some(([i, v]) => {
    const idx = Number(i);
    return (idx === 9 || idx === 10) && v >= 2; // assédio/violência
  });

  const handleSave = async (finalize = false) => {
    if (!empresaId) { toast({ title: 'Selecione uma empresa', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const status = finalize ? 'finalizado' as const : 'rascunho' as const;
      const data = {
        type: 'arp' as const,
        title: title || 'ARP sem título',
        empresa_id: empresaId,
        setor_id: setorId || null,
        description,
        status,
        score_total: totalScore,
        risk_classification: classification as 'baixo' | 'moderado' | 'alto' | 'critico',
        evaluator_id: user?.id,
        finalized_at: finalize ? new Date().toISOString() : null,
      };

      let assessmentId = id;
      if (isEdit) {
        await supabase.from('assessments').update(data).eq('id', id);
      } else {
        const { data: created, error } = await supabase.from('assessments').insert(data).select('id').single();
        if (error) throw error;
        assessmentId = created.id;
      }

      await supabase.from('assessment_items').delete().eq('assessment_id', assessmentId!);
      const items = ARP_QUESTIONS.map((q, i) => ({
        assessment_id: assessmentId,
        domain: 'psicossocial',
        question_number: i,
        question_text: q,
        weight: 10,
        value: values[i] ?? 0,
        comment: comments[i] || null,
      }));
      await supabase.from('assessment_items').insert(items);

      toast({ title: finalize ? 'ARP finalizada' : 'ARP salva como rascunho' });
      navigate('/riscos-psicossociais');
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? 'Editar ARP' : 'Nova Avaliação Psicossocial'}</h1>
          <p className="text-muted-foreground">Fatores psicossociais e organizacionais</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/riscos-psicossociais')}>Voltar</Button>
      </div>

      {/* Score */}
      <Card className="mb-6 border-2 border-primary/20">
        <CardContent className="p-6 flex flex-wrap items-center gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Score</p>
            <p className="text-4xl font-bold">{totalScore.toFixed(1)}</p>
          </div>
          <Badge variant={classification === 'baixo' ? 'secondary' : classification === 'moderado' ? 'default' : 'destructive'} className="text-base px-4 py-1">
            {classification.charAt(0).toUpperCase() + classification.slice(1)}
          </Badge>
          {hasCritical && <Badge variant="destructive" className="text-sm px-4 py-1">Alerta confidencial — item crítico identificado</Badge>}
        </CardContent>
      </Card>

      {/* Identification */}
      <Card className="mb-6">
        <CardHeader><CardTitle>Identificação</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: ARP Setor Administrativo" />
            </div>
            <div className="space-y-2">
              <Label>Empresa *</Label>
              <Select value={empresaId} onValueChange={setEmpresaId}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{empresas?.map((e) => <SelectItem key={e.id} value={e.id}>{e.razao_social}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Setor</Label>
              <Select value={setorId} onValueChange={setSetorId}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{setores?.map((s) => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions in Cards Grid */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Fatores Psicossociais (score 0–3)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ARP_QUESTIONS.map((q, i) => {
            const val = values[i] ?? 0;
            const isCriticalItem = (i === 9 || i === 10) && val >= 2;
            return (
              <Card key={i} className={isCriticalItem ? 'border-destructive border-2' : val === 3 ? 'border-amber-500 border' : ''}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-snug">{i + 1}) {q}</p>
                    {val > 0 && (
                      <Badge variant={val === 3 ? 'destructive' : val === 2 ? 'default' : 'secondary'} className="shrink-0 text-xs">
                        {val}/3
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SCORE_LABELS.map((label, v) => (
                      <Button key={v} type="button" variant={values[i] === v ? 'default' : 'outline'} size="sm"
                        className="text-xs h-8 justify-start"
                        onClick={() => setValues((prev) => ({ ...prev, [i]: v }))}>{label}</Button>
                    ))}
                  </div>
                  <Input placeholder="Observação (opcional)" value={comments[i] || ''} onChange={(e) => setComments((prev) => ({ ...prev, [i]: e.target.value }))} className="text-sm h-8" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <Button variant="outline" onClick={() => navigate('/riscos-psicossociais')}>Cancelar</Button>
        <Button variant="secondary" onClick={() => handleSave(false)} disabled={saving}>Salvar Rascunho</Button>
        <Button onClick={() => handleSave(true)} disabled={saving}>Finalizar ARP</Button>
      </div>
    </div>
  );
};

export default ARPForm;
