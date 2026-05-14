import { readFileSync, writeFileSync } from 'fs';
import { jsPDF } from 'jspdf';

const mdPath = 'docs/audit/audit_report.md';
const pdfPath = 'docs/audit/audit_report.pdf';

try {
  const content = readFileSync(mdPath, 'utf-8');
  const doc = new jsPDF();
  
  // Simplificação: apenas texto básico para o PDF gerado via script
  const splitText = doc.splitTextToSize(content, 180);
  doc.text(splitText, 10, 10);
  
  doc.save(pdfPath);
  console.log('PDF de auditoria gerado com sucesso.');
} catch (error) {
  console.error('Erro ao gerar PDF:', error);
  process.exit(1);
}
