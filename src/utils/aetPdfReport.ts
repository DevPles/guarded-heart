import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { downloadPdfFromDoc, loadBrandLogo, loadImageAsBase64, resizeImage } from '@/utils/pdfDownload';
import { C, M, needsNewPage, drawHeader, drawFooter, sectionTitle, subHeader, drawSignatures } from '@/utils/pdfShared';

/* ── Tipos ─────────────────────────────────────────────────────────────── */
export interface AetReportData {
  title: string;
  empresa: string;
  companyLogoUrl?: string;
  cnpj?: string;
  cnae?: string;
  grauRisco?: number;
  unidade?: string;
  setor?: string;
  cargo?: string;
  cbo?: string;
  colaborador?: string;
  evaluator?: string;
  date: string;
  finalizedAt?: string;
  completionPercent?: number;
  sectionEntries: { title: string; content: string }[];
  checklist: { label: string; checked: boolean }[];
}

export interface PdfGenerationOptions { autoDownload?: boolean; }

/* ── Gerador AET ──────────────────────────────────────────────────────── */
export async function generateAetPdf(data: AetReportData, options: PdfGenerationOptions = {}) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pw = doc.internal.pageSize.getWidth();

  const [brandLogo, companyLogo] = await Promise.all([
    loadBrandLogo(),
    data.companyLogoUrl ? loadImageAsBase64(data.companyLogoUrl).then(r => r ? resizeImage(r, 220, 120) : null) : Promise.resolve(null),
  ]);

  let y = drawHeader(doc, brandLogo, companyLogo);

  // ── Título ──
  doc.setFontSize(15); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C.navy);
  doc.text('LAUDO DE ANÁLISE ERGONÔMICA', pw / 2, y, { align: 'center' });
  y += 5;
  doc.text('DO TRABALHO (AET)', pw / 2, y, { align: 'center' });
  y += 4;
  doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...C.muted);
  doc.text('Conforme NR-17 item 17.3.3 — Portaria MTP nº 423/2021', pw / 2, y, { align: 'center' });
  doc.setTextColor(...C.text);
  y += 8;

  // ── 1. IDENTIFICAÇÃO ──
  y = sectionTitle(doc, '1. Identificação da Situação de Trabalho', y);
  const idRows = [
    ['Título da AET', data.title],
    ['Empresa / Razão Social', data.empresa],
    ['CNPJ', data.cnpj || '—'],
    ['CNAE', data.cnae || '—'],
    ['Grau de Risco (NR-4)', data.grauRisco ? String(data.grauRisco) : '—'],
    ['Unidade / Estabelecimento', data.unidade || '—'],
    ['Setor / Departamento', data.setor || '—'],
    ['Cargo / Função', data.cargo || '—'],
    ['CBO', data.cbo || '—'],
    ['Colaborador de Referência', data.colaborador || '—'],
    ['Avaliador Responsável', data.evaluator || '—'],
    ['Data de Realização', data.date],
    ['Data de Finalização', data.finalizedAt || '—'],
    ['Preenchimento', data.completionPercent != null ? `${data.completionPercent}%` : '—'],
  ];
  autoTable(doc, {
    startY: y, body: idRows, theme: 'plain',
    styles: { fontSize: 8, cellPadding: { top: 1.5, bottom: 1.5, left: 4, right: 4 } },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 52, fillColor: C.hdr, textColor: C.navy },
      1: { cellWidth: 'auto' },
    },
    alternateRowStyles: { fillColor: C.stripe },
    margin: { left: M, right: M },
    tableLineColor: C.border,
    tableLineWidth: 0.15,
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  // ── 2. CONTEÚDO TÉCNICO ──
  y = needsNewPage(doc, y, 20);
  y = sectionTitle(doc, '2. Conteúdo Técnico da Análise', y);

  const entries = data.sectionEntries.length > 0
    ? data.sectionEntries
    : [{ title: 'Descrição geral', content: 'Nenhuma seção narrativa foi registrada.' }];

  // Agrupar por seção principal
  const sectionGroups: Record<string, { title: string; content: string }[]> = {};
  for (const entry of entries) {
    let group = 'Geral';
    const lt = entry.title.toLowerCase();
    if (lt.includes('demanda') || lt.includes('origem') || lt.includes('contexto') || lt.includes('reformula') || lt.includes('popula')) group = '2.1 Demanda e Contextualização';
    else if (lt.includes('tarefa') || lt.includes('organizac') || lt.includes('mobiliari') || lt.includes('condicoes') || lt.includes('exigenc')) group = '2.2 Análise da Atividade';
    else if (lt.includes('abordagem') || lt.includes('tecnica') || lt.includes('instrumento') || lt.includes('periodo')) group = '2.3 Métodos e Técnicas';
    else if (lt.includes('sintese') || lt.includes('fatores') || lt.includes('relac') || lt.includes('ponto')) group = '2.4 Diagnóstico Ergonômico';
    else if (lt.includes('imediata') || lt.includes('curto') || lt.includes('medio') || lt.includes('hierarquia')) group = '2.5 Recomendações';
    else if (lt.includes('participa') || lt.includes('validac') || lt.includes('acompanha')) group = '2.6 Restituição e Validação';

    if (!sectionGroups[group]) sectionGroups[group] = [];
    sectionGroups[group].push(entry);
  }

  for (const [groupName, groupEntries] of Object.entries(sectionGroups)) {
    y = needsNewPage(doc, y, 20);
    y = subHeader(doc, groupName, y);

    for (const entry of groupEntries) {
      y = needsNewPage(doc, y, 15);
      doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C.navy);
      doc.text(entry.title + ':', M + 3, y);
      doc.setTextColor(...C.text);
      y += 4;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
      const lines = doc.splitTextToSize(entry.content || 'Não preenchido', pw - M * 2 - 8);
      for (const line of lines) {
        y = needsNewPage(doc, y, 4);
        doc.text(line, M + 5, y);
        y += 3.4;
      }
      y += 2.5;
    }
  }

  // ── 3. CHECKLIST NR-17 ──
  y = needsNewPage(doc, y, 30);
  y += 3;
  y = sectionTitle(doc, '3. Checklist de Conformidade NR-17', y);

  const ckRows = data.checklist.length > 0
    ? data.checklist.map(c => [c.label, c.checked ? 'CONFORME' : 'PENDENTE'])
    : [['Nenhum item registrado', '—']];

  autoTable(doc, {
    startY: y,
    head: [['Item avaliado', 'Status']],
    body: ckRows,
    theme: 'grid',
    headStyles: { fillColor: C.navy, textColor: 255, fontSize: 8, fontStyle: 'bold', cellPadding: 2 },
    styles: { fontSize: 7.5, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
    },
    alternateRowStyles: { fillColor: C.stripe },
    didParseCell: (h: any) => {
      if (h.section === 'body' && h.column.index === 1) {
        h.cell.styles.textColor = h.cell.raw === 'CONFORME' ? C.green : C.red;
      }
    },
    margin: { left: M, right: M },
    tableLineColor: C.border,
    tableLineWidth: 0.15,
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  // Índice de conformidade
  const conformes = data.checklist.filter(c => c.checked).length;
  const total = data.checklist.length || 1;
  const pct = Math.round((conformes / total) * 100);
  y = needsNewPage(doc, y, 18);

  const pctColor: [number, number, number] = pct >= 70 ? [235, 250, 240] : pct >= 40 ? [255, 248, 230] : [255, 240, 240];
  const pctBorder: [number, number, number] = pct >= 70 ? C.green : pct >= 40 ? C.amber : C.red;

  doc.setFillColor(...pctColor);
  doc.roundedRect(M, y, pw - M * 2, 13, 1.5, 1.5, 'F');
  doc.setDrawColor(...pctBorder); doc.setLineWidth(0.5);
  doc.line(M, y, M, y + 13); // barra lateral
  doc.setDrawColor(...C.border); doc.setLineWidth(0.15);

  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C.navy);
  doc.text(`ÍNDICE DE CONFORMIDADE NR-17: ${pct}%`, M + 5, y + 8);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...C.muted);
  doc.text(`(${conformes} de ${data.checklist.length} itens conformes)`, M + 5 + doc.getTextWidth(`ÍNDICE DE CONFORMIDADE NR-17: ${pct}%  `) - 5, y + 8);
  doc.setTextColor(...C.text);
  y += 19;

  // ── 4. FUNDAMENTAÇÃO LEGAL ──
  y = needsNewPage(doc, y, 40);
  y = sectionTitle(doc, '4. Fundamentação Legal e Encaminhamentos', y);
  doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
  const legal = [
    '• A presente AET foi desenvolvida conforme NR-17, item 17.3.3 (Portaria MTP nº 423/2021).',
    '• Os resultados subsidiam o plano de ação ergonômico e integram o PGR (NR-1).',
    '• Recomenda-se monitoramento contínuo e reavaliação após implementação das medidas.',
    '• Este documento constitui evidência técnica para auditorias e fiscalizações.',
    '• A participação dos trabalhadores na análise e validação é requisito da NR-17 item 17.3.3.',
  ];
  for (const l of legal) {
    y = needsNewPage(doc, y, 5);
    doc.text(l, M + 3, y);
    y += 4;
  }

  // ── 5. ASSINATURAS ──
  y = needsNewPage(doc, y, 32);
  drawSignatures(doc, y, data.evaluator);

  // Footers
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) { doc.setPage(i); drawFooter(doc, i, pages, 'Laudo Técnico AET'); }

  // Download
  const fn = `Laudo_AET_${(data.empresa || 'empresa').replace(/\s+/g, '_')}_${data.date.replace(/\//g, '-')}.pdf`;
  if (options.autoDownload !== false) downloadPdfFromDoc(doc, fn);
}
