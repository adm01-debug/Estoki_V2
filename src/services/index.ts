 // Re-export all services
 export * from "./abcService";
 export * from "./alertService";
 export * from "./analyticsService";
 export * from "./auditService";
 export * from "./authService";
 export * from "./backupService";
 export * from "./barcodeService";
 export * from "./batchService";
 export * from "./cacheService";
 export * from "./carrierService";
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
 
 // Service factory for dependency injection
 export function createServices() {
   return {
     abc: require('./abcService').abcService,
     alert: require('./alertService').alertService,
     analytics: require('./analyticsService').analyticsService,
     audit: require('./auditService').auditService,
     auth: require('./authService').authService,
     backup: require('./backupService').backupService,
     barcode: require('./barcodeService').barcodeService,
     batch: require('./batchService').batchService,
     estoque: require('./estoqueService').estoqueService,
     inventory: require('./inventoryService').inventoryService,
     order: require('./orderService').orderService,
     product: require('./productService').productService,
     stock: require('./stockService').stockService,
   };
 }
