import { abcService } from './abcService';
import { alertService } from './alertService';
import { analyticsService } from './analyticsService';
import { auditService } from './auditService';
import { authService } from './authService';
import { backupService } from './backupService';
import { barcodeService } from './barcodeService';
import { batchService } from './batchService';
import { estoqueService } from './estoqueService';
import { inventoryService } from './inventoryService';
import { orderService } from './orderService';
import { productService } from './productService';
import { stockService } from './stockService';

export * from "./abcService";
export * from "./alertService";
export * from "./analyticsService";
export * from "./auditService";
export * from "./authService";
export * from "./backupService";
export * from "./barcodeService";
export * from "./batchService";
export * from "./categoryService";
export * from "./customerService";
export * from "./estoqueService";
export * from "./gamificacaoService";
export * from "./inventoryService";
export * from "./locationService";
export * from "./lotService";
export * from "./movimentacaoService";
export * from "./notificacaoService";
export * from "./orderService";
export * from "./posicaoService";
export * from "./productService";
export * from "./recebimentoService";
export * from "./relatorioService";
export * from "./stockService";
export * from "./supplierService";
export * from "./triagemService";
export * from "./warehouseService";

export function createServices() {
  return {
    abc: abcService,
    alert: alertService,
    analytics: analyticsService,
    audit: auditService,
    auth: authService,
    backup: backupService,
    barcode: barcodeService,
    batch: batchService,
    estoque: estoqueService,
    inventory: inventoryService,
    order: orderService,
    product: productService,
    stock: stockService,
  };
}
