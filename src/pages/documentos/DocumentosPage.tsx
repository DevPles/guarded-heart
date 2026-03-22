import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, FileText, PenTool } from 'lucide-react';

const TIPO_DOC_OPTIONS = [
  { value: 'AEP', label: 'AEP' },
  { value: 'AET', label: 'AET' },
  { value: 'ARP', label: 'ARP' },
  { value: 'ASO', label: 'ASO' },
  { value: 'PCMSO', label: 'PCMSO' },
  { value: 'PGR', label: 'PGR' },
  { value: 'LAUDO', label: 'Laudo' },
  { value: 'OUTROS', label: 'Outros' },
];

const DocumentosPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [empresaFilter, setEmpresaFilter] = useState('all');
  const [showNew, setShowNew] = useState(false);

  const [form, setForm] = useState({
    empresa_id: '', tipo_documento: '', titulo: '', data_emissao: '', validade: '', proximo_vencimento: '',
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas-docs'],
    queryFn: async () => {
      const { data } = await supabase.from('empresas').select('id, razao_social').eq('ativa', true).order('razao_social');
      return data ?? [];
    },
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents', empresaFilter],
    queryFn: async () => {
      let q = supabase.from('documents').select('*, empresas:empresa_id(razao_social)').order('proximo_vencimento', { ascending: true });
      if (empresaFilter !== 'all') q = q.eq('empresa_id', empresaFilter);
      const { data } = await q.limit(200);
      return (data ?? []) as any[];
    },
  });

  const { data: signatures = [] } = useQuery({
    queryKey: ['signatures-recent'],
    queryFn: async () => {
      const { data } = await supabase.from('signatures').select('*, documents:document_id(titulo, tipo_documento)').order('created_at', { ascending: false }).limit(20);
      return (data ?? []) as any[];
    },
  });

  const createDocument = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('documents').insert(form as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({ title: 'Documento registrado' });
      setShowNew(false);
      setForm({ empresa_id: '', tipo_documento: '', titulo: '', data_emissao: '', validade: '', proximo_vencimento: '' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const isExpiringSoon = (date: string | null) => {
    if (!date) return false;
    const diff = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diff <= 30 && diff > 0;
  };
  const isExpired = (date: string | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const vencidos = documents.filter((d: any) => isExpired(d.proximo_vencimento)).length;
  const aVencer = documents.filter((d: any) => isExpiringSoon(d.proximo_vencimento)).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documentos e Vencimentos</h1>
          <p className="text-muted-foreground">Controle de documentos, versões e assinaturas</p>
        </div>
        <Select value={empresaFilter} onValueChange={setEmpresaFilter}>
          <SelectTrigger className="w-60"><SelectValue placeholder="Filtrar empresa..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {empresas.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.razao_social}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{documents.length}</p>
          <p className="text-sm text-muted-foreground">Total Documentos</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{documents.filter((d: any) => d.status === 'vigente').length}</p>
          <p className="text-sm text-muted-foreground">Vigentes</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{aVencer}</p>
          <p className="text-sm text-muted-foreground">A Vencer (30 dias)</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-destructive">{vencidos}</p>
          <p className="text-sm text-muted-foreground">Vencidos</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="documentos">
        <TabsList>
          <TabsTrigger value="documentos"><FileText className="h-4 w-4 mr-1" /> Documentos</TabsTrigger>
          <TabsTrigger value="assinaturas"><PenTool className="h-4 w-4 mr-1" /> Assinaturas</TabsTrigger>
        </TabsList>

        <TabsContent value="documentos" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={showNew} onOpenChange={setShowNew}>
              <DialogTrigger asChild>
                <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="h-4 w-4 mr-1" /> Novo Documento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Registrar Documento</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Empresa</Label>
                    <Select value={form.empresa_id} onValueChange={v => setForm(p => ({ ...p, empresa_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>{empresas.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.razao_social}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={form.tipo_documento} onValueChange={v => setForm(p => ({ ...p, tipo_documento: v }))}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>{TIPO_DOC_OPTIONS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Título</Label>
                      <Input value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Emissão</Label>
                      <Input type="date" value={form.data_emissao} onChange={e => setForm(p => ({ ...p, data_emissao: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Validade</Label>
                      <Input type="date" value={form.validade} onChange={e => setForm(p => ({ ...p, validade: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Próx. Vencimento</Label>
                      <Input type="date" value={form.proximo_vencimento} onChange={e => setForm(p => ({ ...p, proximo_vencimento: e.target.value }))} />
                    </div>
                  </div>
                  <Button onClick={() => createDocument.mutate()} disabled={!form.empresa_id || !form.titulo || !form.tipo_documento} className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Registrar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Emissão</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum documento</TableCell></TableRow>
                  ) : documents.map((doc: any) => (
                    <TableRow key={doc.id} className={isExpired(doc.proximo_vencimento) ? 'bg-red-50 dark:bg-red-950/20' : isExpiringSoon(doc.proximo_vencimento) ? 'bg-amber-50 dark:bg-amber-950/20' : ''}>
                      <TableCell><Badge variant="outline">{doc.tipo_documento}</Badge></TableCell>
                      <TableCell className="font-medium">{doc.titulo}</TableCell>
                      <TableCell>{doc.empresas?.razao_social}</TableCell>
                      <TableCell>{doc.data_emissao || '—'}</TableCell>
                      <TableCell>{doc.proximo_vencimento || '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={isExpired(doc.proximo_vencimento) ? 'bg-red-100 text-red-700' : doc.status === 'vigente' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}>
                          {isExpired(doc.proximo_vencimento) ? 'Vencido' : doc.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assinaturas" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Documento</TableHead>
                    <TableHead>Tipo Doc</TableHead>
                    <TableHead>Assinante</TableHead>
                    <TableHead>Tipo Assinatura</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signatures.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma assinatura</TableCell></TableRow>
                  ) : signatures.map((sig: any) => (
                    <TableRow key={sig.id}>
                      <TableCell className="font-medium">{sig.documents?.titulo}</TableCell>
                      <TableCell><Badge variant="outline">{sig.documents?.tipo_documento}</Badge></TableCell>
                      <TableCell>{sig.signer_name}</TableCell>
                      <TableCell className="capitalize">{sig.sign_type}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={sig.status === 'assinado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                          {sig.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{sig.signed_at ? new Date(sig.signed_at).toLocaleDateString('pt-BR') : 'Pendente'}</TableCell>
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

export default DocumentosPage;
