import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { downloadPdfFromDoc, loadBrandLogo } from '@/utils/pdfDownload';
import { C, M, needsNewPage, drawHeader, drawFooter, sectionTitle, subHeader, drawSignatures } from '@/utils/pdfShared';

const tipoLabels: Record<string, string> = {
  admissional: 'Admissional',
  periodico: 'Periódico',
  retorno: 'Retorno ao Trabalho',
  mudanca_risco: 'Mudança de Função',
  demissional: 'Demissional',
};

interface PcmsoPdfData {
  programa: any;
  empresa: any;
  eventos: any[];
}

export async function generatePcmsoPdf(data: PcmsoPdfData) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pw = doc.internal.pageSize.getWidth();
  const brandLogo = await loadBrandLogo();
  const today = new Date();

  let y = drawHeader(doc, brandLogo, null);

  // ── Título ──
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.navy);
  doc.text('RELATÓRIO DO PROGRAMA DE', pw / 2, y, { align: 'center' });
  y += 5;
  doc.text('CONTROLE MÉDICO DE SAÚDE', pw / 2, y, { align: 'center' });
  y += 5;
  doc.text('OCUPACIONAL — PCMSO', pw / 2, y, { align: 'center' });
  y += 4;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.muted);
  doc.text('Conforme NR-07 — Portaria MTP nº 567/2022', pw / 2, y, { align: 'center' });
  doc.setTextColor(...C.text);
  y += 8;

  // ── 1. IDENTIFICAÇÃO DA EMPRESA ──
  y = sectionTitle(doc, '1. Identificação da Empresa', y);
  const empresa = data.empresa || {};
  const idRows = [
    ['Razão Social', empresa.razao_social || '—'],
    ['CNPJ', empresa.cnpj || '—'],
    ['CNAE', empresa.cnae || '—'],
    ['Grau de Risco (NR-4)', empresa.grau_risco ? String(empresa.grau_risco) : '—'],
    ['Endereço', [empresa.endereco_logradouro, empresa.endereco_numero, empresa.endereco_bairro, empresa.endereco_cidade, empresa.endereco_uf].filter(Boolean).join(', ') || '—'],
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
    tableLineColor: C.border, tableLineWidth: 0.15,
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  // ── 2. DADOS DO PROGRAMA ──
  y = needsNewPage(doc, y, 40);
  y = sectionTitle(doc, '2. Dados do Programa PCMSO', y);
  const prog = data.programa;
  const progRows = [
    ['Médico Coordenador', prog.responsavel_medico || '—'],
    ['CRM', prog.crm || '—'],
    ['Vigência', `${prog.data_inicio || '—'} a ${prog.data_fim || '∞'}`],
    ['Versão', `v${prog.versao || 1}`],
    ['Status', prog.status || '—'],
    ['Observações', prog.observacoes || 'Nenhuma'],
  ];
  autoTable(doc, {
    startY: y, body: progRows, theme: 'plain',
    styles: { fontSize: 8, cellPadding: { top: 1.5, bottom: 1.5, left: 4, right: 4 } },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, fillColor: C.hdr, textColor: C.navy },
      1: { cellWidth: 'auto' },
    },
    alternateRowStyles: { fillColor: C.stripe },
    margin: { left: M, right: M },
    tableLineColor: C.border, tableLineWidth: 0.15,
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  // ── 3. INDICADORES DE SAÚDE OCUPACIONAL ──
  y = needsNewPage(doc, y, 50);
  y = sectionTitle(doc, '3. Indicadores de Saúde Ocupacional', y);

  const eventosArr = data.eventos || [];
  const totalEventos = eventosArr.length;
  const realizados = eventosArr.filter(e => !!e.data_realizada);
  const pendentes = eventosArr.filter(e => !e.data_realizada);
  const vencidos = eventosArr.filter(e => !e.data_realizada && e.data_prevista && new Date(e.data_prevista) < today);
  const aptos = eventosArr.filter(e => e.resultado === 'apto');
  const inaptos = eventosArr.filter(e => e.resultado === 'inapto');
  const aptosRestricao = eventosArr.filter(e => e.resultado === 'apto_restricao');
  const conformidade = totalEventos > 0 ? Math.round((realizados.length / totalEventos) * 100) : 100;

  const kpiRows = [
    ['Total de Exames Programados', String(totalEventos)],
    ['Exames Realizados', String(realizados.length)],
    ['Exames Pendentes', String(pendentes.length)],
    ['Exames Vencidos', String(vencidos.length)],
    ['Índice de Conformidade', `${conformidade}%`],
    ['', ''],
    ['Aptos', String(aptos.length)],
    ['Inaptos', String(inaptos.length)],
    ['Aptos com Restrição', String(aptosRestricao.length)],
    ['Sem Resultado', String(totalEventos - aptos.length - inaptos.length - aptosRestricao.length)],
  ];

  autoTable(doc, {
    startY: y, body: kpiRows, theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70, fillColor: C.hdr, textColor: C.navy },
      1: { halign: 'center', cellWidth: 40, fontStyle: 'bold' },
    },
    didParseCell: (d: any) => {
      if (d.section === 'body' && d.column.index === 1) {
        const row = d.row.index;
        if (row === 3) d.cell.styles.textColor = C.red; // vencidos
        if (row === 4) d.cell.styles.textColor = conformidade >= 80 ? C.green : conformidade >= 50 ? C.amber : C.red;
        if (row === 6) d.cell.styles.textColor = C.green;
        if (row === 7) d.cell.styles.textColor = C.red;
        if (row === 8) d.cell.styles.textColor = C.amber;
      }
    },
    margin: { left: M, right: M },
    tableLineColor: C.border, tableLineWidth: 0.15,
  });
  y = (doc as any).lastAutoTable.finalY + 4;

  // Interpretação da conformidade
  y = needsNewPage(doc, y, 15);
  const interpText = conformidade >= 80
    ? `O programa apresenta índice de conformidade satisfatório (${conformidade}%). Manter acompanhamento periódico e agenda preventiva.`
    : conformidade >= 50
      ? `O programa apresenta índice de conformidade moderado (${conformidade}%). Recomenda-se intensificar o agendamento de exames pendentes e regularizar a situação em até 30 dias.`
      : `O programa apresenta índice de conformidade crítico (${conformidade}%). Ações imediatas são necessárias para regularizar os exames vencidos e pendentes. Risco de autuação por descumprimento da NR-07.`;

  const interpColor: [number, number, number] = conformidade >= 80 ? [240, 250, 242] : conformidade >= 50 ? [255, 248, 230] : [255, 240, 240];
  const interpBorder: [number, number, number] = conformidade >= 80 ? C.green : conformidade >= 50 ? C.amber : C.red;
  const interpLines = doc.splitTextToSize(interpText, pw - M * 2 - 10);
  const boxH = interpLines.length * 3.5 + 5;
  doc.setFillColor(...interpColor);
  doc.roundedRect(M, y, pw - M * 2, boxH, 1, 1, 'F');
  doc.setDrawColor(...interpBorder); doc.setLineWidth(0.4);
  doc.line(M, y, M, y + boxH);
  doc.setDrawColor(...C.border); doc.setLineWidth(0.15);
  doc.setFontSize(7); doc.setFont('helvetica', 'italic'); doc.setTextColor(...C.text);
  doc.text(interpLines, M + 5, y + 3.5);
  doc.setFont('helvetica', 'normal');
  y += boxH + 8;

  // ── 4. QUADRO DE EXAMES / EVENTOS ──
  y = needsNewPage(doc, y, 30);
  y = sectionTitle(doc, '4. Quadro de Exames / Eventos', y);

  if (eventosArr.length === 0) {
    doc.setFontSize(8); doc.setTextColor(...C.muted);
    doc.text('Nenhum exame registrado para este programa.', M + 4, y + 4);
    y += 10;
  } else {
    // Group by tipo
    const byTipo = eventosArr.reduce((acc: Record<string, any[]>, ev) => {
      const t = ev.tipo || 'outros';
      if (!acc[t]) acc[t] = [];
      acc[t].push(ev);
      return acc;
    }, {});

    for (const [tipo, evs] of Object.entries(byTipo)) {
      y = needsNewPage(doc, y, 20);
      y = subHeader(doc, tipoLabels[tipo] || tipo, y);

      const rows = (evs as any[]).map(ev => {
        const isVencido = !ev.data_realizada && ev.data_prevista && new Date(ev.data_prevista) < today;
        return [
          ev.colaboradores?.nome_completo || '—',
          ev.data_prevista || '—',
          ev.data_realizada || (isVencido ? 'VENCIDO' : 'Pendente'),
          ev.resultado === 'apto_restricao' ? 'Apto c/ Restrição' : ev.resultado || '—',
          ev.observacoes || '—',
        ];
      });

      autoTable(doc, {
        startY: y,
        head: [['Colaborador', 'Previsto', 'Realizado', 'Resultado', 'Observações']],
        body: rows, theme: 'grid',
        headStyles: { fillColor: C.accent, textColor: 255, fontSize: 7.5, cellPadding: 1.8 },
        styles: { fontSize: 7, cellPadding: 1.5 },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 22, halign: 'center' },
          2: { cellWidth: 22, halign: 'center' },
          3: { cellWidth: 28, halign: 'center' },
          4: { cellWidth: 'auto' },
        },
        alternateRowStyles: { fillColor: C.stripe },
        didParseCell: (d: any) => {
          if (d.section === 'body') {
            if (d.column.index === 2 && d.cell.raw === 'VENCIDO') {
              d.cell.styles.textColor = C.red;
              d.cell.styles.fontStyle = 'bold';
            }
            if (d.column.index === 3) {
              const v = String(d.cell.raw).toLowerCase();
              if (v === 'apto') d.cell.styles.textColor = C.green;
              else if (v === 'inapto') d.cell.styles.textColor = C.red;
              else if (v.includes('restri')) d.cell.styles.textColor = C.amber;
            }
          }
        },
        margin: { left: M, right: M },
        tableLineColor: C.border, tableLineWidth: 0.15,
      });
      y = (doc as any).lastAutoTable.finalY + 5;
    }
  }

  // ── 5. EXAMES VENCIDOS ──
  if (vencidos.length > 0) {
    y = needsNewPage(doc, y, 25);
    y = sectionTitle(doc, '5. Exames Vencidos — Ação Necessária', y);

    const vencRows = vencidos.map(ev => [
      ev.colaboradores?.nome_completo || '—',
      tipoLabels[ev.tipo] || ev.tipo,
      ev.data_prevista || '—',
      `${Math.ceil((today.getTime() - new Date(ev.data_prevista).getTime()) / (1000 * 60 * 60 * 24))} dias`,
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Colaborador', 'Tipo', 'Data Prevista', 'Atraso']],
      body: vencRows, theme: 'grid',
      headStyles: { fillColor: C.red, textColor: 255, fontSize: 7.5, cellPadding: 1.8 },
      styles: { fontSize: 7, cellPadding: 1.5 },
      bodyStyles: { fillColor: [255, 245, 245] as [number, number, number] },
      columnStyles: {
        3: { halign: 'center', fontStyle: 'bold', textColor: C.red },
      },
      margin: { left: M, right: M },
      tableLineColor: C.border, tableLineWidth: 0.15,
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // ── 6. FUNDAMENTAÇÃO LEGAL ──
  const legalSn = vencidos.length > 0 ? 6 : 5;
  y = needsNewPage(doc, y, 50);
  y = sectionTitle(doc, `${legalSn}. Fundamentação Legal`, y);
  doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
  const legal = [
    'Este relatório foi elaborado em conformidade com:',
    '',
    '• NR-07 — Programa de Controle Médico de Saúde Ocupacional (Portaria MTP nº 567/2022)',
    '• Item 7.4.1 — O PCMSO deve incluir exames admissionais, periódicos,',
    '  de retorno ao trabalho, de mudança de riscos e demissionais.',
    '• Item 7.5.1 — O médico responsável deve elaborar relatório analítico',
    '  do Programa de Controle Médico de Saúde Ocupacional.',
    '• NR-01 — Disposições Gerais e Gerenciamento de Riscos Ocupacionais',
    '• CLT Art. 168 — Obrigatoriedade dos exames médicos ocupacionais.',
    '',
    'O relatório analítico deve ser apresentado anualmente e conter:',
    '  - Número de exames clínicos realizados;',
    '  - Estatísticas de resultados considerados anormais;',
    '  - Incidência e prevalência de doenças relacionadas ao trabalho;',
    '  - Informações sobre o número e natureza dos afastamentos.',
  ];
  for (const l of legal) { y = needsNewPage(doc, y, 4); doc.text(l, M + 3, y); y += 3.5; }
  y += 4;

  // ── 7. RECOMENDAÇÕES ──
  const recSn = legalSn + 1;
  y = needsNewPage(doc, y, 35);
  y = sectionTitle(doc, `${recSn}. Recomendações`, y);
  doc.setFontSize(7.5);

  const recs = conformidade >= 80
    ? [
      '• Manter cronograma de exames conforme periodicidade definida no PCMSO.',
      '• Reavaliação anual do programa conforme NR-07.',
      '• Manter registros atualizados e acessíveis para fiscalização.',
      '• Promover ações de promoção à saúde dos trabalhadores.',
    ]
    : conformidade >= 50
      ? [
        '• Regularizar exames pendentes em até 30 dias.',
        '• Revisar cronograma de agendamento para evitar novos vencimentos.',
        '• Intensificar comunicação com gestores sobre convocações.',
        '• Avaliar necessidade de ampliar capacidade de atendimento clínico.',
        '• Registrar justificativas para ausências documentadas.',
      ]
      : [
        '• AÇÃO IMEDIATA: Regularizar todos os exames vencidos.',
        '• Convocar colaboradores com exames em atraso formalmente.',
        '• Risco de autuação por descumprimento da NR-07 — buscar conformidade urgente.',
        '• Revisar completamente o cronograma do PCMSO.',
        '• Comunicar SESMT e direção sobre a situação crítica.',
        '• Considerar contratação de serviço terceirizado para mutirão de exames.',
        '• Documentar todas as ações corretivas adotadas.',
      ];

  for (const r of recs) { y = needsNewPage(doc, y, 5); doc.text(r, M + 3, y); y += 4; }

  // ── Assinaturas ──
  y = needsNewPage(doc, y, 30);
  drawSignatures(doc, y, prog.responsavel_medico);

  // Footers
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) { doc.setPage(i); drawFooter(doc, i, pages, 'Relatório PCMSO'); }

  // Download
  const fn = `Relatorio_PCMSO_${(empresa?.razao_social || 'empresa').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  downloadPdfFromDoc(doc, fn);
}
