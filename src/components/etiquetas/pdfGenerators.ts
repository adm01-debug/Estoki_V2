import QRCode from "qrcode";
import { gerarCodigoUnico, tamanhos, type LoteItem, type EntregaItem, type TamanhoEtiqueta } from "./EtiquetaPreview";

export async function generateLotePDF(doc: InstanceType<typeof import('jspdf').jsPDF>, lotesToPrint: LoteItem[], tamanho: TamanhoEtiqueta, volumesPorLote: number) {
  const { width, height } = tamanhos[tamanho];
  let pageIndex = 0;
  for (const lote of lotesToPrint) {
    for (let vol = 1; vol <= volumesPorLote; vol++) {
      if (pageIndex > 0) doc.addPage([width, height]);
      pageIndex++;
      const code = gerarCodigoUnico("MAT", lote.id);
      const qrDataUrl = await QRCode.toDataURL(code, { width: 400, margin: 1 });
      doc.setFillColor(255, 255, 255); doc.rect(0, 0, width, height, "F");
      const headerH = tamanho === "10x15" ? 12 : 8;
      doc.setFillColor(37, 99, 235); doc.rect(0, 0, width, headerH, "F");
      doc.setTextColor(255, 255, 255); doc.setFontSize(tamanho === "10x15" ? 12 : 8); doc.setFont("helvetica", "bold");
      doc.text("ESTOKI — IDENTIFICAÇÃO", width / 2, headerH * 0.65, { align: "center" });
      doc.setTextColor(0, 0, 0);
      const margin = 5; let y = headerH + 6;
      doc.setFontSize(tamanho === "10x15" ? 11 : 7); doc.setFont("helvetica", "bold");
      doc.text((lote.produto_nome || "Produto").substring(0, 40), margin, y);
      y += tamanho === "10x15" ? 5 : 4;
      if (lote.produto_sku) { doc.setFontSize(tamanho === "10x15" ? 8 : 6); doc.setFont("helvetica", "normal"); doc.text(`SKU: ${lote.produto_sku}`, margin, y); y += tamanho === "10x15" ? 5 : 3; }
      doc.setDrawColor(200, 200, 200); doc.line(margin, y, width - margin, y); y += tamanho === "10x15" ? 5 : 3;
      const qrSize = tamanho === "10x15" ? 40 : 22;
      doc.addImage(qrDataUrl, "PNG", margin, y, qrSize, qrSize);
      const infoX = margin + qrSize + 5; let infoY = y + 2;
      const lineH = tamanho === "10x15" ? 6 : 4;
      doc.setFontSize(tamanho === "10x15" ? 9 : 6);
      const fields = [{ label: "Código", value: code }, { label: "Lote", value: lote.numero_lote }, { label: "NF", value: lote.nf_entrada || "—" }, { label: "Qtd", value: `${lote.quantidade_atual} un` }, { label: "Volume", value: `${vol}/${volumesPorLote}` }];
      if (lote.fornecedor) fields.push({ label: "Fornec", value: lote.fornecedor.substring(0, 20) });
      for (const f of fields) { doc.setFont("helvetica", "bold"); doc.text(`${f.label}: `, infoX, infoY); const lw = doc.getTextWidth(`${f.label}: `); doc.setFont("helvetica", "normal"); doc.text(f.value, infoX + lw, infoY); infoY += lineH; }
      const footerY = height - 8;
      doc.setDrawColor(200, 200, 200); doc.line(margin, footerY - 2, width - margin, footerY - 2);
      doc.setFontSize(tamanho === "10x15" ? 7 : 5); doc.setFont("helvetica", "normal");
      doc.text(`Recebido: ${new Date(lote.data_recebimento).toLocaleDateString("pt-BR")}`, margin, footerY + 1);
      doc.text(`Impresso: ${new Date().toLocaleDateString("pt-BR")}`, width - margin, footerY + 1, { align: "right" });
    }
  }
  return pageIndex;
}

export async function generateEntregaPDF(doc: InstanceType<typeof import('jspdf').jsPDF>, entregasToPrint: EntregaItem[], tamanho: TamanhoEtiqueta) {
  const { width, height } = tamanhos[tamanho];
  let pageIndex = 0;
  for (const ent of entregasToPrint) {
    if (pageIndex > 0) doc.addPage([width, height]);
    pageIndex++;
    const code = gerarCodigoUnico("ENT", ent.id);
    const qrDataUrl = await QRCode.toDataURL(code, { width: 400, margin: 1 });
    doc.setFillColor(255, 255, 255); doc.rect(0, 0, width, height, "F");
    const headerH = tamanho === "10x15" ? 12 : 8;
    doc.setFillColor(37, 99, 235); doc.rect(0, 0, width, headerH, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(tamanho === "10x15" ? 12 : 8); doc.setFont("helvetica", "bold");
    doc.text("ESTOKI — ENTREGA", width / 2, headerH * 0.65, { align: "center" });
    doc.setTextColor(0, 0, 0);
    const margin = 5; let y = headerH + 6;
    doc.setFontSize(tamanho === "10x15" ? 11 : 7); doc.setFont("helvetica", "bold");
    doc.text(ent.cliente.substring(0, 40), margin, y); y += tamanho === "10x15" ? 5 : 4;
    doc.setFontSize(tamanho === "10x15" ? 8 : 6); doc.setFont("courier", "normal"); doc.text(code, margin, y); doc.setFont("helvetica", "normal"); y += tamanho === "10x15" ? 5 : 3;
    doc.setDrawColor(200, 200, 200); doc.line(margin, y, width - margin, y); y += tamanho === "10x15" ? 5 : 3;
    const qrSize = tamanho === "10x15" ? 40 : 22;
    doc.addImage(qrDataUrl, "PNG", margin, y, qrSize, qrSize);
    const infoX = margin + qrSize + 5; let infoY = y + 2;
    const lineH = tamanho === "10x15" ? 6 : 4;
    doc.setFontSize(tamanho === "10x15" ? 9 : 6);
    const fields: { label: string; value: string }[] = [];
    if (ent.pedido_referencia) fields.push({ label: "Pedido", value: ent.pedido_referencia });
    if (ent.nf_saida) fields.push({ label: "NF", value: ent.nf_saida });
    fields.push({ label: "Qtd", value: `${ent.quantidade} un` });
    if (ent.peso_kg) fields.push({ label: "Peso", value: `${ent.peso_kg} kg` });
    if (ent.ordem_entrega) fields.push({ label: "Ordem", value: `#${ent.ordem_entrega}` });
    for (const f of fields) { doc.setFont("helvetica", "bold"); doc.text(`${f.label}: `, infoX, infoY); const lw = doc.getTextWidth(`${f.label}: `); doc.setFont("helvetica", "normal"); doc.text(f.value, infoX + lw, infoY); infoY += lineH; }
    const addrY = y + qrSize + 4;
    if (addrY < height - 15) { doc.setFontSize(tamanho === "10x15" ? 8 : 5); doc.setFont("helvetica", "normal"); const addrLines = doc.splitTextToSize(ent.endereco_entrega, width - margin * 2); doc.text(addrLines.slice(0, 2), margin, addrY); }
    const footerY = height - 8;
    doc.setDrawColor(200, 200, 200); doc.line(margin, footerY - 2, width - margin, footerY - 2);
    doc.setFontSize(tamanho === "10x15" ? 7 : 5); doc.setFont("helvetica", "normal");
    doc.text(`Romaneio: ${ent.romaneio_codigo || "—"}`, margin, footerY + 1);
    doc.text(`Impresso: ${new Date().toLocaleDateString("pt-BR")}`, width - margin, footerY + 1, { align: "right" });
  }
  return pageIndex;
}
