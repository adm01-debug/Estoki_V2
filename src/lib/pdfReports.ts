import jsPDF from "jspdf";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PDFReportOptions {
  title: string;
  subtitle?: string;
  periodo?: { inicio: Date; fim: Date };
  resumo?: { label: string; valor: string | number }[];
}

const COLORS = {
  primary: [59, 130, 246] as [number, number, number],
  dark: [15, 23, 42] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  bg: [248, 250, 252] as [number, number, number],
};

function addHeader(doc: jsPDF, options: PDFReportOptions) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header bar
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 28, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(options.title, 14, 18);

  // Subtitle / date
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const dateStr = `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`;
  doc.text(dateStr, pageWidth - 14, 18, { align: "right" });

  if (options.periodo) {
    doc.text(
      `Período: ${format(options.periodo.inicio, "dd/MM/yyyy")} a ${format(options.periodo.fim, "dd/MM/yyyy")}`,
      pageWidth - 14,
      24,
      { align: "right" }
    );
  }

  let y = 36;

  // Summary cards
  if (options.resumo && options.resumo.length > 0) {
    const cardWidth = (pageWidth - 28 - (options.resumo.length - 1) * 6) / options.resumo.length;

    options.resumo.forEach((item, i) => {
      const x = 14 + i * (cardWidth + 6);

      doc.setFillColor(...COLORS.bg);
      doc.setDrawColor(...COLORS.border);
      doc.roundedRect(x, y, cardWidth, 22, 2, 2, "FD");

      doc.setTextColor(...COLORS.muted);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(item.label.toUpperCase(), x + 6, y + 9);

      doc.setTextColor(...COLORS.dark);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(String(item.valor), x + 6, y + 18);
    });

    y += 30;
  }

  return y;
}

function addFooter(doc: jsPDF, pageNumber: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setDrawColor(...COLORS.border);
  doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("WMS - Sistema de Gestão de Armazém", 14, pageHeight - 8);
  doc.text(`Página ${pageNumber}`, pageWidth - 14, pageHeight - 8, { align: "right" });
}

interface TableColumn {
  header: string;
  key: string;
  width?: number;
  align?: "left" | "center" | "right";
}

function addTable(doc: jsPDF, startY: number, columns: TableColumn[], data: Record<string, any>[]) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const tableWidth = pageWidth - 28;
  const defaultWidth = tableWidth / columns.length;
  let y = startY;
  let pageNum = 1;

  // Column widths
  const colWidths = columns.map((c) => c.width || defaultWidth);
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  const scale = tableWidth / totalWidth;
  const scaledWidths = colWidths.map((w) => w * scale);

  // Header row
  doc.setFillColor(...COLORS.primary);
  doc.rect(14, y, tableWidth, 10, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");

  let xPos = 14;
  columns.forEach((col, i) => {
    doc.text(col.header, xPos + 3, y + 7);
    xPos += scaledWidths[i];
  });
  y += 10;

  // Data rows
  doc.setFont("helvetica", "normal");
  data.forEach((row, rowIndex) => {
    if (y > doc.internal.pageSize.getHeight() - 25) {
      addFooter(doc, pageNum);
      pageNum++;
      doc.addPage();
      y = 20;
    }

    const isEven = rowIndex % 2 === 0;
    if (isEven) {
      doc.setFillColor(...COLORS.bg);
      doc.rect(14, y, tableWidth, 8, "F");
    }

    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(7.5);

    xPos = 14;
    columns.forEach((col, i) => {
      const value = String(row[col.key] ?? "");
      const truncated = value.length > 35 ? value.substring(0, 32) + "..." : value;
      doc.text(truncated, xPos + 3, y + 5.5);
      xPos += scaledWidths[i];
    });

    y += 8;
  });

  addFooter(doc, pageNum);
  return y;
}

// ============ Public API ============

export function exportInventarioPDF(
  contagens: Record<string, unknown>[],
  ciclo: { nome: string; acuracidade: number; posicoes_contadas: number; total_posicoes: number }
) {
  const doc = new jsPDF();
  const divergencias = contagens.filter(
    (c) => c.quantidade_contada !== null && c.quantidade_contada !== c.quantidade_sistema
  );

  const y = addHeader(doc, {
    title: "Relatório de Inventário Cíclico",
    subtitle: ciclo.nome,
    resumo: [
      { label: "Acuracidade", valor: `${ciclo.acuracidade?.toFixed(1) ?? 0}%` },
      { label: "Posições Contadas", valor: `${ciclo.posicoes_contadas}/${ciclo.total_posicoes}` },
      { label: "Divergências", valor: divergencias.length },
    ],
  });

  addTable(doc, y, [
    { header: "Posição", key: "posicao", width: 50 },
    { header: "Produto", key: "produto", width: 70 },
    { header: "Qtd Sistema", key: "qtd_sistema", width: 30 },
    { header: "Qtd Contada", key: "qtd_contada", width: 30 },
    { header: "Diferença", key: "diferenca", width: 30 },
    { header: "Status", key: "status", width: 30 },
  ], contagens.map((c) => ({
    posicao: c.posicao_codigo || c.posicao_id,
    produto: c.produto_nome || c.produto_id || "-",
    qtd_sistema: c.quantidade_sistema,
    qtd_contada: c.quantidade_contada ?? "Pendente",
    diferenca: c.quantidade_contada !== null ? c.quantidade_contada - c.quantidade_sistema : "-",
    status: c.status,
  })));

  doc.save(`inventario-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

export function exportProdutividadePDF(
  operadores: { nome: string; tarefas_concluidas: number; taxa_acerto: number; tempo_medio: number }[]
) {
  const doc = new jsPDF();
  const totalTarefas = operadores.reduce((a, o) => a + o.tarefas_concluidas, 0);
  const mediaAcerto = operadores.length > 0
    ? operadores.reduce((a, o) => a + o.taxa_acerto, 0) / operadores.length
    : 0;

  const y = addHeader(doc, {
    title: "Relatório de Produtividade",
    resumo: [
      { label: "Total Operadores", valor: operadores.length },
      { label: "Total Tarefas", valor: totalTarefas },
      { label: "Média Acerto", valor: `${mediaAcerto.toFixed(1)}%` },
    ],
  });

  addTable(doc, y, [
    { header: "Operador", key: "nome", width: 60 },
    { header: "Tarefas Concluídas", key: "tarefas", width: 40 },
    { header: "Taxa Acerto", key: "acerto", width: 35 },
    { header: "Tempo Médio (min)", key: "tempo", width: 40 },
  ], operadores.map((o) => ({
    nome: o.nome,
    tarefas: o.tarefas_concluidas,
    acerto: `${o.taxa_acerto.toFixed(1)}%`,
    tempo: o.tempo_medio.toFixed(0),
  })));

  doc.save(`produtividade-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

export function exportDivergenciasPDF(
  divergencias: { fornecedor: string; lote: string; produto: string; pedido: number; recebido: number; diferenca: number }[]
) {
  const doc = new jsPDF();
  const totalDivergencias = divergencias.length;
  const totalDiferenca = divergencias.reduce((a, d) => a + Math.abs(d.diferenca), 0);

  const y = addHeader(doc, {
    title: "Relatório de Divergências",
    resumo: [
      { label: "Total Divergências", valor: totalDivergencias },
      { label: "Diferença Acumulada", valor: `${totalDiferenca} un` },
      { label: "Fornecedores Afetados", valor: new Set(divergencias.map((d) => d.fornecedor)).size },
    ],
  });

  addTable(doc, y, [
    { header: "Fornecedor", key: "fornecedor", width: 50 },
    { header: "Lote", key: "lote", width: 35 },
    { header: "Produto", key: "produto", width: 50 },
    { header: "Pedido", key: "pedido", width: 25 },
    { header: "Recebido", key: "recebido", width: 25 },
    { header: "Diff", key: "diferenca", width: 25 },
  ], divergencias);

  doc.save(`divergencias-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}
