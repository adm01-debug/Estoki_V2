import jsPDF from 'jspdf';

export const generatePDF = (title: string, content: string): jsPDF => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 20, 20);
  doc.setFontSize(12);
  doc.text(content, 20, 40);
  return doc;
};

export const downloadPDF = (doc: jsPDF, filename: string): void => {
  doc.save(`${filename}.pdf`);
};

export const generateTablePDF = (title: string, headers: string[], data: string[][]): jsPDF => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 20, 20);
  
  let y = 40;
  const cellWidth = 180 / headers.length;
  
  doc.setFontSize(10);
  headers.forEach((h, i) => doc.text(h, 20 + i * cellWidth, y));
  y += 10;
  
  data.forEach(row => {
    row.forEach((cell, i) => doc.text(String(cell).slice(0, 20), 20 + i * cellWidth, y));
    y += 8;
    if (y > 280) { doc.addPage(); y = 20; }
  });
  
  return doc;
};
