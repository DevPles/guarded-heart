import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { downloadPdfFromDoc, loadBrandLogo, loadImageAsBase64, resizeImage } from '@/utils/pdfDownload';
import { C, M, needsNewPage, drawHeader, drawFooter, sectionTitle, drawSignatures } from '@/utils/pdfShared';

const SCORE_MAP: Record<number, string> = { 0: 'Adequado', 1: 'Leve', 2: 'Moderado', 3: 'Alto' };
const classLabel = (c: string) => ({ baixo: 'BAIXO', moderado: 'MODERADO', alto: 'ALTO', critico: 'CRÍTICO' }[c] || c.toUpperCase());
const classColor = (c: string): [number, number, number] => ({ baixo: C.green, moderado: C.amber, alto: C.red, critico: C.darkRed }[c] || C.text);

/* ── Tipos ─────────────────────────────────────────────────────────────── */
export interface AepReportData {
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
  description?: string;
  evaluator?: string;
  date: string;
  finalizedAt?: string;
  totalScore: number;
  classification: string;
  needsAet: boolean;
  blocks: {
    label: string;
    domain: string;
    weight: number;
    score: number;
    questions: { number: number; text: string; value: number; comment?: string }[];
  }[];
}

export interface PdfGenerationOptions { autoDownload?: boolean; }

/* ── Gerador AEP ──────────────────────────────────────────────────────── */
export async function generateAepPdf(data: AepReportData, options: PdfGenerationOptions = {}) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pw = doc.internal.pageSize.getWidth();

  const [brandLogo, companyLogo] = await Promise.all([
    loadBrandLogo(),
    data.companyLogoUrl ? loadImageAsBase64(data.companyLogoUrl).then(r => r ? resizeImage(r, 220, 120) : null) : Promise.resolve(null),
  ]);

  let y = drawHeader(doc, brandLogo, companyLogo);

  // ── Título do documento ──
  doc.setFontSize(15); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C.navy);
  doc.text('LAUDO DE AVALIAÇÃO ERGONÔMICA', pw / 2, y, { align: 'center' });
  y += 5;
  doc.text('PRELIMINAR (AEP)', pw / 2, y, { align: 'center' });
  y += 4;
  doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...C.muted);
  doc.text('Conforme NR-17 item 17.1.1 — Portaria MTP nº 423/2021', pw / 2, y, { align: 'center' });
  doc.setTextColor(...C.text);
  y += 8;

  // ── 1. IDENTIFICAÇÃO ──
  y = sectionTitle(doc, '1. Identificação', y);
  const idRows = [
    ['Título', data.title],
    ['Empresa / Razão Social', data.empresa],
    ['CNPJ', data.cnpj || '—'],
    ['CNAE', data.cnae || '—'],
    ['Grau de Risco (NR-4)', data.grauRisco ? String(data.grauRisco) : '—'],
    ['Unidade', data.unidade || '—'],
    ['Setor', data.setor || '—'],
    ['Cargo / Função', data.cargo || '—'],
    ['CBO', data.cbo || '—'],
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

  // ── 2. DESCRIÇÃO DA ATIVIDADE ──
  if (data.description) {
    y = needsNewPage(doc, y, 25);
    y = sectionTitle(doc, '2. Descrição da Atividade', y);
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

  if (data.needsAet) {
    doc.setFillColor(...C.red);
    const nw = 48;
    doc.roundedRect(M + 55 + cw + 6, y + 6, nw, 10, 2.5, 2.5, 'F');
    doc.setFontSize(7.5); doc.setTextColor(...C.white);
    doc.text('⚠ NECESSITA AET', M + 55 + cw + 6 + nw / 2, y + 12.5, { align: 'center' });
    doc.setTextColor(...C.text);
  }
  y += 26;

  // Tabela resumo blocos
  const blockRows = data.blocks.map(b => {
    const lvl = b.score <= (b.weight * 0.33) ? 'Baixo' : b.score <= (b.weight * 0.66) ? 'Moderado' : 'Alto';
    return [b.label, `${b.weight}%`, b.score.toFixed(1), lvl];
  });
  autoTable(doc, {
    startY: y,
    head: [['Bloco / Domínio', 'Peso', 'Score', 'Nível']],
    body: blockRows,
    theme: 'grid',
    headStyles: { fillColor: C.navy, textColor: 255, fontSize: 8, fontStyle: 'bold', cellPadding: 2 },
    styles: { fontSize: 7.5, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 18 },
      2: { halign: 'center', cellWidth: 18 },
      3: { halign: 'center', cellWidth: 24 },
    },
    alternateRowStyles: { fillColor: C.stripe },
    didParseCell: (d: any) => {
      if (d.section === 'body' && d.column.index === 3) {
        const v = d.cell.raw as string;
        d.cell.styles.textColor = v === 'Alto' ? C.red : v === 'Moderado' ? C.amber : C.green;
        d.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { left: M, right: M },
    tableLineColor: C.border,
    tableLineWidth: 0.15,
  });
  y = (doc as any).lastAutoTable.finalY + 7;

  // ── 4. DETALHAMENTO POR BLOCO ──
  const ds = sn + 1;
  data.blocks.forEach((block, bi) => {
    y = needsNewPage(doc, y, 25);
    y = sectionTitle(doc, `${ds}.${bi + 1} ${block.label}`, y);

    const qRows = block.questions.map(q => [
      `${q.number}) ${q.text}`,
      SCORE_MAP[q.value] ?? String(q.value),
      q.comment || '—',
    ]);
    autoTable(doc, {
      startY: y,
      head: [['Pergunta', 'Resposta', 'Observação']],
      body: qRows,
      theme: 'grid',
      headStyles: { fillColor: C.accent, textColor: 255, fontSize: 7.5, cellPadding: 1.8 },
      styles: { fontSize: 7, cellPadding: 1.5 },
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
        }
      },
      margin: { left: M, right: M },
      tableLineColor: C.border,
      tableLineWidth: 0.15,
    });
    y = (doc as any).lastAutoTable.finalY + 4;

    // Interpretação técnica
    y = needsNewPage(doc, y, 14);
    const lvl = block.score <= (block.weight * 0.33) ? 'baixo' : block.score <= (block.weight * 0.66) ? 'moderado' : 'alto';
    const interp = lvl === 'baixo'
      ? `O domínio "${block.label}" apresenta condições adequadas (score ${block.score.toFixed(1)}/${block.weight}). Manter monitoramento periódico.`
      : lvl === 'moderado'
        ? `O domínio "${block.label}" apresenta risco moderado (score ${block.score.toFixed(1)}/${block.weight}). Recomenda-se intervenções corretivas em até 90 dias.`
        : `O domínio "${block.label}" apresenta risco alto (score ${block.score.toFixed(1)}/${block.weight}). Ações imediatas são necessárias. Considerar AET específica.`;

    const interpColor: [number, number, number] = lvl === 'baixo' ? [240, 250, 242] : lvl === 'moderado' ? [255, 248, 230] : [255, 240, 240];
    const interpBorder: [number, number, number] = lvl === 'baixo' ? C.green : lvl === 'moderado' ? C.amber : C.red;

    doc.setFillColor(...interpColor);
    const interpLines = doc.splitTextToSize(interp, pw - M * 2 - 10);
    const boxH = interpLines.length * 3.5 + 5;
    doc.roundedRect(M, y, pw - M * 2, boxH, 1, 1, 'F');
    doc.setDrawColor(...interpBorder); doc.setLineWidth(0.4);
    doc.line(M, y, M, y + boxH); // barra lateral colorida
    doc.setDrawColor(...C.border); doc.setLineWidth(0.15);
    doc.setFontSize(7); doc.setFont('helvetica', 'italic'); doc.setTextColor(...C.text);
    doc.text(interpLines, M + 5, y + 3.5);
    doc.setFont('helvetica', 'normal');
    y += boxH + 6;
  });

  // ── 5. FUNDAMENTAÇÃO LEGAL ──
  y = needsNewPage(doc, y, 50);
  const ls = ds + 1;
  y = sectionTitle(doc, `${ls}. Fundamentação Legal`, y);
  doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
  const legal = [
    'Este laudo foi elaborado em conformidade com:',
    '',
    '• NR-17 — Ergonomia (Portaria MTP nº 423, de 07 de outubro de 2021)',
    '• Item 17.1.1 — A organização deve realizar AEP das situações de trabalho.',
    '• Item 17.1.1.1 — A AEP pode ser realizada por abordagens qualitativas,',
    '  semiquantitativas, quantitativas ou combinação dessas.',
    '• Item 17.1.2 — Quando indicado pela AEP, deve ser realizada AET.',
    '• NR-1 — Disposições Gerais e Gerenciamento de Riscos Ocupacionais (GRO/PGR)',
    '',
    'Critérios de classificação:',
    '  Baixo (0–33): situação adequada, monitoramento periódico',
    '  Moderado (34–66): ações corretivas necessárias em até 90 dias',
    '  Alto (67–100): intervenção imediata, necessidade de AET',
  ];
  for (const l of legal) { y = needsNewPage(doc, y, 4); doc.text(l, M + 3, y); y += 3.5; }
  y += 4;

  // ── 6. RECOMENDAÇÕES ──
  y = needsNewPage(doc, y, 35);
  const rs = ls + 1;
  y = sectionTitle(doc, `${rs}. Recomendações Técnicas`, y);
  doc.setFontSize(7.5);
  const recs = data.classification === 'baixo'
    ? ['• Manter condições atuais com monitoramento periódico.', '• Reavaliação conforme periodicidade do PGR.', '• Manter programa de conscientização em ergonomia.']
    : data.classification === 'moderado'
      ? ['• Implementar plano de ação corretivo nos domínios com maior pontuação.', '• Reavaliação em prazo máximo de 90 dias.', '• Melhorias no posto de trabalho, mobiliário e organização.', '• Treinamento específico em ergonomia.', '• Registrar ações no Plano de Ação do PGR.']
      : ['• AÇÃO IMEDIATA: Realizar AET conforme NR-17 item 17.1.2.', '• Medidas emergenciais para redução de exposição ao risco.', '• Avaliar rodízio, pausas e reorganização da atividade.', '• Considerar redesenho do posto de trabalho.', '• Reavaliação em prazo máximo de 30 dias.', '• Comunicar SESMT e CIPA sobre os riscos identificados.', '• Registrar todas as ações no PGR com prazos definidos.'];
  for (const r of recs) { y = needsNewPage(doc, y, 5); doc.text(r, M + 3, y); y += 4; }

  // ── Assinaturas ──
  y = needsNewPage(doc, y, 30);
  drawSignatures(doc, y, data.evaluator);

  // Footers em todas as páginas
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) { doc.setPage(i); drawFooter(doc, i, pages, 'Laudo Técnico AEP'); }

  // Download
  const fn = `Laudo_AEP_${(data.empresa || 'empresa').replace(/\s+/g, '_')}_${data.date.replace(/\//g, '-')}.pdf`;
  if (options.autoDownload !== false) downloadPdfFromDoc(doc, fn);
}
