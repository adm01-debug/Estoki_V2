import { DashboardKPIs, OcupacaoPP, ItemParado } from "@/hooks/useDashboard";

export async function exportDashboardToPDF(
  kpis: DashboardKPIs,
  ocupacaoPP: OcupacaoPP[],
  itensParados: ItemParado[]
) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const dataAtual = new Date().toLocaleDateString("pt-BR");
  const horaAtual = new Date().toLocaleTimeString("pt-BR");

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Inventário ESTOKI", 105, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Gerado em: ${dataAtual} às ${horaAtual}`, 105, 28, { align: "center" });

  doc.setLineWidth(0.5);
  doc.line(20, 32, 190, 32);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Indicadores Principais (KPIs)", 20, 42);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const kpiData = [
    [`Taxa de Ocupação: ${kpis.taxaOcupacao}%`, `Posições Ocupadas: ${kpis.posicoesOcupadas}/${kpis.totalPosicoes}`],
    [`Giro Médio: ${kpis.giroMedio} dias`, `Itens Parados (+30d): ${kpis.itensParados30dias}`],
    [`Entradas Hoje: ${kpis.entradasHoje}`, `Saídas Hoje: ${kpis.saidasHoje}`],
  ];

  let yPos = 50;
  kpiData.forEach(row => {
    doc.text(row[0], 20, yPos);
    doc.text(row[1], 110, yPos);
    yPos += 8;
  });

  if (ocupacaoPP.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Ocupação por Porta-Palete", 20, yPos + 10);
    yPos += 18;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    ocupacaoPP.slice(0, 10).forEach(pp => {
      doc.text(`${pp.nome}: ${pp.ocupado}/${pp.total} posições (${pp.percentual}%)`, 20, yPos);
      yPos += 7;
    });
  }

  if (itensParados.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Itens Parados há mais de 30 dias", 20, yPos + 10);
    yPos += 18;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("SKU", 20, yPos);
    doc.text("Descrição", 45, yPos);
    doc.text("Posição", 110, yPos);
    doc.text("Dias", 140, yPos);
    doc.text("Qtd", 160, yPos);
    yPos += 6;

    doc.setFont("helvetica", "normal");
    itensParados.slice(0, 15).forEach(item => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(item.sku.substring(0, 12), 20, yPos);
      doc.text(item.descricao.substring(0, 30), 45, yPos);
      doc.text(item.posicao, 110, yPos);
      doc.text(item.diasParado.toString(), 140, yPos);
      doc.text(item.quantidade.toString(), 160, yPos);
      yPos += 6;
    });
  }

  yPos += 10;
  if (yPos > 280) {
    doc.addPage();
    yPos = 20;
  }
  doc.setFont("helvetica", "bold");
  doc.text(`Valor Total de Itens Parados: R$ ${(kpis.valorParado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPos);

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text(`ESTOKI - Sistema de Gestão de Estoque - Página ${i} de ${pageCount}`, 105, 285, { align: "center" });
  }

  doc.save(`relatorio-inventario-dashboard-${dataAtual.replace(/\//g, "-")}.pdf`);
}