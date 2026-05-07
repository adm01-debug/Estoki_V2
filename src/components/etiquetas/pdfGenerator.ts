import { EtiquetaData, TamanhoEtiqueta, tamanhos } from "./types";

const formatDate = (date: Date) => {
  return date.toLocaleDateString("pt-BR");
};

export const generateEtiquetasPDF = async (
  data: EtiquetaData,
  qtdEtiquetas: number,
  tamanho: TamanhoEtiqueta,
  qrCodeUrls: string[]
) => {
  const { width, height } = tamanhos[tamanho];
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({
    orientation: width > height ? "landscape" : "portrait",
    unit: "mm",
    format: [width, height],
  });

  for (let i = 0; i < qtdEtiquetas; i++) {
    if (i > 0) {
      doc.addPage([width, height]);
    }

    // Fundo branco
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, width, height, "F");

    // Header azul
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, width, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("ESTOKI - ESTOQUE", width / 2, 5.5, { align: "center" });

    // Reset cor do texto
    doc.setTextColor(0, 0, 0);

    // Informações do pedido
    const startY = 12;
    const leftMargin = 4;
    const lineHeight = 4;

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(`PEDIDO: ${data.pedido}`, leftMargin, startY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    
    // Truncar produto se necessário
    const maxProductLength = tamanho === "10x7" ? 35 : 25;
    const truncatedProduct = data.produto.length > maxProductLength 
      ? data.produto.substring(0, maxProductLength) + "..." 
      : data.produto;
    doc.text(`PRODUTO: ${truncatedProduct}`, leftMargin, startY + lineHeight);
    doc.text(`LOTE: ${data.lote}`, leftMargin, startY + lineHeight * 2);

    // QR Code
    const qrSize = tamanho === "10x7" ? 25 : 18;
    const qrX = leftMargin;
    const qrY = startY + lineHeight * 3 + 2;

    if (qrCodeUrls[i]) {
      doc.addImage(qrCodeUrls[i], "PNG", qrX, qrY, qrSize, qrSize);
    }

    // Informações ao lado do QR
    const infoX = qrX + qrSize + 4;
    const infoY = qrY + 3;
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(`📦 VOLUME: ${i + 1}/${qtdEtiquetas}`, infoX, infoY);
    
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(`📊 QTD: ~${data.qtdPorVolume} un`, infoX, infoY + 5);
    doc.text(`📅 ${formatDate(data.dataRecebimento)}`, infoX, infoY + 10);

    // Rodapé
    const footerY = height - 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(leftMargin, footerY - 2, width - leftMargin, footerY - 2);
    
    doc.setFontSize(6);
    doc.text(`FORNECEDOR: ${data.fornecedor}`, leftMargin, footerY + 1);
    doc.text(`ENDEREÇO: PP__-S__-N__`, leftMargin, footerY + 5);
  }

  const fileName = `etiquetas_${data.pedido}_${Date.now()}.pdf`;
  doc.save(fileName);
  return fileName;
};
