export const printElement = (elementId: string): void => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  printWindow.document.write('<html><head><title>Imprimir</title>');
  printWindow.document.write('<style>body { font-family: Arial; }</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write(element.innerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
};

export const printTable = (data: Record<string, unknown>[], columns: string[]): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  let html = '<table border="1" style="border-collapse: collapse; width: 100%;">';
  html += '<tr>' + columns.map(c => `<th style="padding: 8px;">${c}</th>`).join('') + '</tr>';
  data.forEach(row => {
    html += '<tr>' + columns.map(c => `<td style="padding: 8px;">${row[c] || ''}</td>`).join('') + '</tr>';
  });
  html += '</table>';
  
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
};
