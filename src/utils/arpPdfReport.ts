import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { downloadPdfFromDoc, loadBrandLogo, loadImageAsBase64, resizeImage } from '@/utils/pdfDownload';
import { C, M, needsNewPage, drawHeader, drawFooter, sectionTitle, drawSignatures } from '@/utils/pdfShared';

const SCORE_MAP: Record<number, string> = { 0: 'Adequado', 1: 'Leve', 2: 'Moderado', 3: 'Alto' };
const classLabel = (c: string) => ({ baixo: 'BAIXO', moderado: 'MODERADO', alto: 'ALTO', critico: 'CRÍTICO' }[c] || c.toUpperCase());
const classColor = (c: string): [number, number, number] => ({ baixo: C.green, moderado: C.amber, alto: C.red, critico: C.darkRed }[c] || C.text);

/* ── Tipos ─────────────────────────────────────────────────────────────── */
export interface ArpReportData {
  title: string;
  empresa: string;
  companyLogoUrl?: string;
  cnpj?: string;
  cnae?: string;
  grauRisco?: number;
  setor?: string;
  description?: string;
  evaluator?: string;
  date: string;
  finalizedAt?: string;
  totalScore: number;
  classification: string;
  hasCritical: boolean;
  questions: { number: number; text: string; value: number; comment?: string }[];
}

export interface PdfGenerationOptions { autoDownload?: boolean; }

/* ── Gerador ARP ──────────────────────────────────────────────────────── */
export async function generateArpPdf(data: ArpReportData, options: PdfGenerationOptions = {}) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pw = doc.internal.pageSize.getWidth();

  const [brandLogo, companyLogo] = await Promise.all([
    loadBrandLogo(),
    data.companyLogoUrl ? loadImageAsBase64(data.companyLogoUrl).then(r => r ? resizeImage(r, 220, 120) : null) : Promise.resolve(null),
  ]);

  let y = drawHeader(doc, brandLogo, companyLogo);

  // ── Título do documento ──
  doc.setFontSize(15); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C.navy);
  doc.text('LAUDO DE AVALIAÇÃO DE RISCOS', pw / 2, y, { align: 'center' });
  y += 5;
  doc.text('PSICOSSOCIAIS (ARP)', pw / 2, y, { align: 'center' });
  y += 4;
  doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...C.muted);
  doc.text('Conforme NR-01 item 1.5.3.1.4 — Fatores de risco psicossociais relacionados ao trabalho', pw / 2, y, { align: 'center' });
  doc.setTextColor(...C.text);
  y += 8;

  // ── 1. IDENTIFICAÇÃO ──
  y = sectionTitle(doc, '1. Identificação', y);
  const idRows = [
    ['Título', data.title || '—'],
    ['Empresa / Razão Social', data.empresa],
    ['CNPJ', data.cnpj || '—'],
    ['CNAE', data.cnae || '—'],
    ['Grau de Risco (NR-4)', data.grauRisco ? String(data.grauRisco) : '—'],
    ['Setor / Departamento', data.setor || '—'],
    ['Avaliador', data.evaluator || '—'],
    ['Data da Avaliação', data.date],
    ['Data de Finalização', data.finalizedAt || '—'],
  ];
  autoTable(doc, {
    startY: y, body: idRows, theme: 'plain',
    styles: { fontSize: 8, cellPadding: { top: 1.5, bottom: 1.5, left: 4, right: 4 } },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, fillColor: C.hdr, textColor: C.navy },
      1: { cellWidth: 'auto' },
    },
    alternateRowStyles: { fillColor: C.stripe },
    margin: { left: M, right: M },
    tableLineColor: C.border,
    tableLineWidth: 0.15,
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  // ── 2. DESCRIÇÃO / OBSERVAÇÕES ──
  if (data.description) {
    y = needsNewPage(doc, y, 25);
    y = sectionTitle(doc, '2. Observações Gerais', y);
    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    const dl = doc.splitTextToSize(data.description, pw - M * 2 - 8);
    doc.setFillColor(...C.bg);
    doc.roundedRect(M, y, pw - M * 2, dl.length * 3.5 + 6, 1.5, 1.5, 'F');
    doc.setDrawColor(...C.border); doc.setLineWidth(0.15);
    doc.roundedRect(M, y, pw - M * 2, dl.length * 3.5 + 6, 1.5, 1.5, 'S');
    doc.text(dl, M + 4, y + 4.5);
    y += dl.length * 3.5 + 10;
  }

  // ── 3. RESULTADO GLOBAL ──
  const sn = data.description ? 3 : 2;
  y = needsNewPage(doc, y, 45);
  y = sectionTitle(doc, `${sn}. Resultado Global`, y);

  const [cr, cg, cb] = classColor(data.classification);

  // Card de resultado
  doc.setFillColor(...C.bg);
  doc.roundedRect(M, y, pw - M * 2, 22, 2, 2, 'F');
  doc.setDrawColor(...C.border); doc.setLineWidth(0.2);
  doc.roundedRect(M, y, pw - M * 2, 22, 2, 2, 'S');

  // Score grande
  doc.setFontSize(28); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C.navy);
  doc.text(data.totalScore.toFixed(1), M + 10, y + 15);
  doc.setFontSize(10); doc.setTextColor(...C.muted);
  doc.text('/ 100', M + 36, y + 15);

  // Badge classificação
  doc.setFillColor(cr, cg, cb);
  const ct = classLabel(data.classification);
  const cw = doc.getTextWidth(ct) + 10;
  doc.roundedRect(M + 55, y + 6, cw, 10, 2.5, 2.5, 'F');
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C.white);
  doc.text(ct, M + 55 + cw / 2, y + 12.5, { align: 'center' });
  doc.setTextColor(...C.text);

  // Alerta crítico
  if (data.hasCritical) {
    doc.setFillColor(...C.darkRed);
    const alertText = 'ALERTA: ITEM CRITICO IDENTIFICADO';
    const aw = doc.getTextWidth(alertText) + 12;
    doc.roundedRect(M + 55 + cw + 6, y + 6, aw, 10, 2.5, 2.5, 'F');
    doc.setFontSize(7.5); doc.setTextColor(...C.white);
    doc.text(alertText, M + 55 + cw + 6 + aw / 2, y + 12.5, { align: 'center' });
    doc.setTextColor(...C.text);
  }
  y += 26;

  // ── 4. DETALHAMENTO DOS FATORES ──
  const ds = sn + 1;
  y = needsNewPage(doc, y, 25);
  y = sectionTitle(doc, `${ds}. Detalhamento dos Fatores Psicossociais`, y);

  const qRows = data.questions.map(q => [
    `${q.number + 1}) ${q.text}`,
    SCORE_MAP[q.value] ?? String(q.value),
    q.comment || '—',
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Fator Psicossocial', 'Nível', 'Observação']],
    body: qRows,
    theme: 'grid',
    headStyles: { fillColor: C.navy, textColor: 255, fontSize: 8, fontStyle: 'bold', cellPadding: 2 },
    styles: { fontSize: 7.5, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 78 },
      1: { cellWidth: 22, halign: 'center' },
      2: { cellWidth: 'auto' },
    },
    alternateRowStyles: { fillColor: C.stripe },
    didParseCell: (d: any) => {
      if (d.section === 'body' && d.column.index === 1) {
        const v = d.cell.raw as string;
        if (v === 'Alto') d.cell.styles.textColor = C.red;
        else if (v === 'Moderado') d.cell.styles.textColor = C.amber;
        else if (v === 'Adequado') d.cell.styles.textColor = C.green;
        d.cell.styles.fontStyle = 'bold';
      }
      // Highlight critical items (assédio/violência)
      if (d.section === 'body' && d.column.index === 0) {
        const rowIdx = d.row.index;
        const q = data.questions[rowIdx];
        if (q && (q.number === 9 || q.number === 10) && q.value >= 2) {
          d.cell.styles.fillColor = [255, 235, 235];
        }
      }
    },
    margin: { left: M, right: M },
    tableLineColor: C.border,
    tableLineWidth: 0.15,
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  // ── Interpretação geral ──
  y = needsNewPage(doc, y, 18);
  const interpText = data.classification === 'baixo'
    ? `A avaliação indica risco psicossocial BAIXO (score ${data.totalScore.toFixed(1)}/100). Os fatores avaliados encontram-se em níveis adequados. Recomenda-se manter monitoramento periódico.`
    : data.classification === 'moderado'
      ? `A avaliação indica risco psicossocial MODERADO (score ${data.totalScore.toFixed(1)}/100). Alguns fatores demandam atenção e intervenção preventiva. Recomenda-se plano de ação em até 90 dias.`
      : `A avaliação indica risco psicossocial ALTO (score ${data.totalScore.toFixed(1)}/100). Fatores críticos foram identificados, exigindo intervenção imediata e acompanhamento contínuo.`;

  const interpColor: [number, number, number] = data.classification === 'baixo' ? [240, 250, 242] : data.classification === 'moderado' ? [255, 248, 230] : [255, 240, 240];
  const interpBorder: [number, number, number] = data.classification === 'baixo' ? C.green : data.classification === 'moderado' ? C.amber : C.red;

  doc.setFillColor(...interpColor);
  const interpLines = doc.splitTextToSize(interpText, pw - M * 2 - 10);
  const boxH = interpLines.length * 3.5 + 5;
  doc.roundedRect(M, y, pw - M * 2, boxH, 1, 1, 'F');
  doc.setDrawColor(...interpBorder); doc.setLineWidth(0.4);
  doc.line(M, y, M, y + boxH);
  doc.setDrawColor(...C.border); doc.setLineWidth(0.15);
  doc.setFontSize(7.5); doc.setFont('helvetica', 'italic'); doc.setTextColor(...C.text);
  doc.text(interpLines, M + 5, y + 3.5);
  doc.setFont('helvetica', 'normal');
  y += boxH + 8;

  // ── 5. FUNDAMENTAÇÃO LEGAL ──
  const ls = ds + 1;
  y = needsNewPage(doc, y, 50);
  y = sectionTitle(doc, `${ls}. Fundamentação Legal`, y);
  doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
  const legal = [
    'Este laudo foi elaborado em conformidade com:',
    '',
    '• NR-01 — Disposições Gerais e Gerenciamento de Riscos Ocupacionais (GRO/PGR)',
    '• Item 1.5.3.1.4 — Identificação de fatores de risco psicossociais relacionados ao trabalho',
    '• NR-17 — Ergonomia (Portaria MTP nº 423/2021) — organização do trabalho',
    '• Lei nº 14.457/2022 — Prevenção e combate ao assédio e violência no trabalho',
    '• Convenção 190 da OIT — Violência e assédio no mundo do trabalho',
    '',
    'Critérios de classificação:',
    '  Baixo (0–33): fatores adequados, monitoramento periódico',
    '  Moderado (34–66): ações preventivas necessárias em até 90 dias',
    '  Alto (67–100): intervenção imediata, encaminhamentos obrigatórios',
  ];
  for (const l of legal) { y = needsNewPage(doc, y, 4); doc.text(l, M + 3, y); y += 3.5; }
  y += 4;

  // ── 6. RECOMENDAÇÕES ──
  const rs = ls + 1;
  y = needsNewPage(doc, y, 35);
  y = sectionTitle(doc, `${rs}. Recomendações Técnicas`, y);
  doc.setFontSize(7.5);

  const recs = data.classification === 'baixo'
    ? [
      '• Manter monitoramento periódico dos fatores psicossociais.',
      '• Reforçar canais de comunicação e suporte à equipe.',
      '• Reavaliação conforme periodicidade do PGR.',
    ]
    : data.classification === 'moderado'
      ? [
        '• Implementar plano de ação preventivo nos fatores com maior pontuação.',
        '• Avaliar carga de trabalho, autonomia e suporte organizacional.',
        '• Promover capacitações sobre gestão de conflitos e liderança.',
        '• Reavaliação em prazo máximo de 90 dias.',
        '• Registrar ações no Plano de Ação do PGR.',
      ]
      : [
        '• AÇÃO IMEDIATA: Investigar fatores com pontuação alta ou crítica.',
        '• Encaminhamento para suporte psicológico quando indicado.',
        '• Avaliação das condições de liderança e clima organizacional.',
        '• Verificar existência de assédio moral ou violência no trabalho.',
        '• Implementar medidas de proteção conforme Lei nº 14.457/2022.',
        '• Reavaliação em prazo máximo de 30 dias.',
        '• Comunicar SESMT e CIPA sobre os riscos identificados.',
        '• Registrar todas as ações no PGR com prazos definidos.',
      ];

  if (data.hasCritical) {
    recs.push('');
    recs.push('ALERTA CONFIDENCIAL:');
    recs.push('• Itens críticos (assédio/violência) foram identificados.');
    recs.push('• Encaminhamento sigiloso obrigatório à gestão de pessoas.');
    recs.push('• Garantir anonimato e proteção do(s) envolvido(s).');
  }

  for (const r of recs) { y = needsNewPage(doc, y, 5); doc.text(r, M + 3, y); y += 4; }

  // ── Assinaturas ──
  y = needsNewPage(doc, y, 30);
  drawSignatures(doc, y, data.evaluator);

  // Footers em todas as páginas
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) { doc.setPage(i); drawFooter(doc, i, pages, 'Laudo Técnico ARP'); }

  // Download
  const fn = `Laudo_ARP_${(data.empresa || 'empresa').replace(/\s+/g, '_')}_${data.date.replace(/\//g, '-')}.pdf`;
  if (options.autoDownload !== false) downloadPdfFromDoc(doc, fn);
}
