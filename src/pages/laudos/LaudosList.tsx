import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { generateAepPdf } from '@/utils/aepPdfReport';
import { generateAetPdf } from '@/utils/aetPdfReport';
import { generateArpPdf } from '@/utils/arpPdfReport';
import { loadBrandLogo } from '@/utils/pdfDownload';

const LaudosList = () => {
  const { toast } = useToast();
  const [filterType, setFilterType] = useState('all');
  const [filterEmpresa, setFilterEmpresa] = useState('all');
  const [filterRisco, setFilterRisco] = useState('all');
  const [downloading, setDownloading] = useState<string | null>(null);

  const { data: assessments, isLoading } = useQuery({
    queryKey: ['laudos-finalizados'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select('*, empresas(razao_social), assessment_items(*)')
        .eq('status', 'finalizado')
        .order('finalized_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas-laudos'],
    queryFn: async () => {
      const { data } = await supabase.from('empresas').select('id, razao_social').eq('ativa', true).order('razao_social');
      return data ?? [];
    },
  });

  const typeLabel: Record<string, string> = { aep: 'AEP', aet: 'AET', arp: 'ARP' };

  const filtered = (assessments ?? []).filter(a => {
    if (filterType !== 'all' && a.type !== filterType) return false;
    if (filterEmpresa !== 'all' && a.empresa_id !== filterEmpresa) return false;
    if (filterRisco !== 'all' && a.risk_classification !== filterRisco) return false;
    return true;
  });

  const handleDownload = async (assessment: any) => {
    setDownloading(assessment.id);
    try {
      const brandLogo = await loadBrandLogo();
      const empresa = (assessment.empresas as any)?.razao_social || '';
      const items = (assessment.assessment_items || []).map((item: any) => ({
        domain: item.domain,
        question_number: item.question_number,
        question_text: item.question_text,
        value: item.value,
        comment: item.comment,
        weight: item.weight,
        na_flag: item.na_flag,
      }));

      const baseData = {
        title: assessment.title || 'Sem título',
        empresa,
        score: assessment.score_total ?? 0,
        classification: assessment.risk_classification || 'baixo',
        evaluator: '',
        date: assessment.finalized_at ? format(new Date(assessment.finalized_at), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy'),
        items,
      };

      if (assessment.type === 'aep') {
        await generateAepPdf(baseData as any);
      } else if (assessment.type === 'aet') {
        await generateAetPdf({ ...baseData, sections: items } as any);
      } else if (assessment.type === 'arp') {
        await generateArpPdf(baseData as any);
      }

      toast({ title: 'PDF gerado com sucesso' });
    } catch (e: any) {
      toast({ title: 'Erro ao gerar PDF', description: e.message, variant: 'destructive' });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Laudos e Relatórios</h1>
          <p className="text-muted-foreground">Avaliações finalizadas disponíveis para geração de PDF</p>
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap">{filtered.length} laudos finalizados</span>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="aep">AEP</SelectItem>
            <SelectItem value="aet">AET</SelectItem>
            <SelectItem value="arp">ARP</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterEmpresa} onValueChange={setFilterEmpresa}>
          <SelectTrigger className="w-60"><SelectValue placeholder="Empresa" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as empresas</SelectItem>
            {empresas.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.razao_social}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterRisco} onValueChange={setFilterRisco}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Risco" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os riscos</SelectItem>
            <SelectItem value="baixo">Baixo</SelectItem>
            <SelectItem value="moderado">Moderado</SelectItem>
            <SelectItem value="alto">Alto</SelectItem>
            <SelectItem value="critico">Crítico</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Risco</TableHead>
                <TableHead>Data Finalização</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum laudo encontrado</TableCell></TableRow>
              ) : (
                filtered.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.title || 'Sem título'}</TableCell>
                    <TableCell><Badge variant="outline">{typeLabel[a.type] || a.type}</Badge></TableCell>
                    <TableCell>{(a.empresas as any)?.razao_social || '—'}</TableCell>
                    <TableCell className="font-mono">{Number(a.score_total).toFixed(1)}</TableCell>
                    <TableCell>
                      <Badge variant={a.risk_classification === 'baixo' ? 'secondary' : a.risk_classification === 'moderado' ? 'default' : 'destructive'}>
                        {a.risk_classification || '—'}
                      </Badge>
                    </TableCell>
                    <TableCell>{a.finalized_at ? format(new Date(a.finalized_at), 'dd/MM/yyyy') : '—'}</TableCell>
                    <TableCell>v{a.version}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        disabled={downloading === a.id}
                        onClick={() => handleDownload(a)}
                      >
                        {downloading === a.id ? 'Gerando...' : 'Baixar PDF'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LaudosList;
