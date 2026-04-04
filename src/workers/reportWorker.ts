/// <reference lib="webworker" />

declare const self: DedicatedWorkerGlobalScope;

interface ReportMessage {
  type: 'GENERATE_REPORT' | 'EXPORT_CSV' | 'EXPORT_PDF' | 'CANCEL';
  payload?: any;
}

interface ReportConfig {
  type: string;
  filters: Record<string, any>;
  columns: string[];
  format: 'json' | 'csv' | 'pdf';
}

let isProcessing = false;
let shouldCancel = false;

self.onmessage = async (event: MessageEvent<ReportMessage>) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'GENERATE_REPORT':
      if (!isProcessing && payload) {
        await generateReport(payload);
      }
      break;

    case 'EXPORT_CSV':
      if (payload) {
        exportToCsv(payload);
      }
      break;

    case 'CANCEL':
      shouldCancel = true;
      break;
  }
};

async function generateReport(config: ReportConfig) {
  isProcessing = true;
  shouldCancel = false;

  self.postMessage({ type: 'REPORT_START', payload: { config } });

  try {
    // Fetch data in chunks
    const pageSize = 1000;
    let page = 0;
    let allData: any[] = [];
    let hasMore = true;

    while (hasMore && !shouldCancel) {
      const response = await fetch(`/api/v1/reports/${config.type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config.filters,
          page,
          pageSize,
        }),
      });

      if (!response.ok) {
        throw new Error(`Report generation failed: ${response.status}`);
      }

      const result = await response.json();
      allData = [...allData, ...result.data];
      hasMore = result.hasMore;
      page++;

      self.postMessage({ 
        type: 'REPORT_PROGRESS', 
        payload: { 
          processed: allData.length, 
          total: result.total,
          percentage: Math.round((allData.length / result.total) * 100)
        } 
      });
    }

    if (shouldCancel) {
      self.postMessage({ type: 'REPORT_CANCELLED' });
      return;
    }

    // Process data
    const processedData = processReportData(allData, config.columns);

    // Export based on format
    let output: any;
    switch (config.format) {
      case 'csv':
        output = convertToCsv(processedData, config.columns);
        break;
      case 'pdf':
        output = { data: processedData, columns: config.columns };
        break;
      default:
        output = processedData;
    }

    self.postMessage({ 
      type: 'REPORT_COMPLETE', 
      payload: { 
        data: output, 
        format: config.format,
        rowCount: processedData.length 
      } 
    });

  } catch (error) {
    self.postMessage({ 
      type: 'REPORT_ERROR', 
      payload: { error: String(error) } 
    });
  } finally {
    isProcessing = false;
    shouldCancel = false;
  }
}

function processReportData(data: any[], columns: string[]): any[] {
  return data.map(row => {
    const processed: Record<string, any> = {};
    columns.forEach(col => {
      processed[col] = row[col];
    });
    return processed;
  });
}

function convertToCsv(data: any[], columns: string[]): string {
  const header = columns.join(',');
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col];
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',')
  );
  return [header, ...rows].join('\n');
}

function exportToCsv(payload: { data: any[]; filename: string }) {
  const csv = convertToCsv(payload.data, Object.keys(payload.data[0] || {}));
  self.postMessage({ 
    type: 'CSV_READY', 
    payload: { csv, filename: payload.filename } 
  });
}

export {};
