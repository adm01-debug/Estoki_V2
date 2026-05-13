 import { logger } from '../utils/logger';
 
/**
 * Cliente Bitrix24 para Produção
 * Integração real com CRM Bitrix24 via REST API
 */

import { envConfig } from './environment';

// Configuração
const BITRIX_WEBHOOK_URL = 'https://promobrindes.bitrix24.com.br/rest/1/ipkwbb32nhewia33';

// Tipos
interface BitrixResponse<T> {
  result: T;
  total?: number;
  next?: number;
  time?: {
    start: number;
    finish: number;
    duration: number;
  };
}

interface BitrixError {
  error: string;
  error_description: string;
}

 interface CRMItem {
   ID: string;
   [key: string]: string | number | boolean | null | undefined | unknown;
 }

// SPAs conhecidas
export const SPA_CONFIG = {
  LALAMOVE: {
    entityTypeId: 1690,
    prefix: 'UF_CRM_276_',
    fields: {
      motorista: 'UF_CRM_276_1758741015',
      placa: 'UF_CRM_276_1728401486',
      contato: 'UF_CRM_276_1728401486_PHONE',
      mapa: 'UF_CRM_276_MAP',
      fotos: 'UF_CRM_276_PHOTOS',
      dataHora: 'UF_CRM_276_DATETIME',
      local: 'UF_CRM_276_LOCATION',
    },
    stages: {
      AUTOMATICO: 730,
      AGENDAMENTOS: 876,
      MANUAL: 1406,
      HISTORICO: 878,
    },
  },
  EXPEDICAO: {
    entityTypeId: 1502,
    prefix: 'UF_CRM_194_',
    fields: {
      motorista: 'UF_CRM_194_1760527413038',
    },
    stages: {
      RECEBIMENTO: 474,
      VISAO_360: 1198,
    },
  },
};

// Classe principal
class Bitrix24Client {
  private baseUrl: string;
   private requestQueue: Promise<unknown>[];
  private maxConcurrent: number;

  constructor(webhookUrl?: string) {
    this.baseUrl = (webhookUrl || BITRIX_WEBHOOK_URL).replace(/\/$/, '');
    this.requestQueue = [];
    this.maxConcurrent = 5;
  }

  // Chamada genérica à API
   async call<T>(method: string, params?: Record<string, unknown>): Promise<BitrixResponse<T>> {
    const url = `${this.baseUrl}/${method}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params || {}),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if ('error' in data) {
        const error = data as BitrixError;
        throw new Error(`Bitrix24 Error: ${error.error} - ${error.error_description}`);
      }

      return data as BitrixResponse<T>;
    } catch (error) {
       logger.error(`[Bitrix24] Erro ao chamar método ${method}`, error, { method, params });
      throw error;
    }
  }

  // Listar itens de SPA
   async listItems<T extends CRMItem = CRMItem>(
     entityTypeId: number,
     options?: {
       select?: string[];
       filter?: Record<string, unknown>;
       order?: Record<string, 'ASC' | 'DESC'>;
       start?: number;
       limit?: number;
     }
   ): Promise<{ items: T[]; total: number; next?: number }> {
     const params: Record<string, unknown> = { entityTypeId };

    if (options?.select) params.select = options.select;
    if (options?.filter) params.filter = options.filter;
    if (options?.order) params.order = options.order;
    if (options?.start) params.start = options.start;

     const response = await this.call<{ items: T[] }>('crm.item.list', params);

    return {
      items: response.result.items || [],
      total: response.total || 0,
      next: response.next,
    };
  }

  // Buscar todos os itens (com paginação automática)
   async listAllItems<T extends CRMItem = CRMItem>(
     entityTypeId: number,
     options?: {
       select?: string[];
       filter?: Record<string, unknown>;
       order?: Record<string, 'ASC' | 'DESC'>;
       maxItems?: number;
     }
   ): Promise<T[]> {
     const allItems: T[] = [];
    let start = 0;
    const maxItems = options?.maxItems || 10000;

    while (allItems.length < maxItems) {
       const { items, next } = await this.listItems<T>(entityTypeId, {
        ...options,
        start,
      });

      allItems.push(...items);

      if (!next || items.length === 0) break;
      start = next;
    }

    return allItems.slice(0, maxItems);
  }

  // Buscar item específico
   async getItem<T extends CRMItem = CRMItem>(entityTypeId: number, id: number | string): Promise<T | null> {
     try {
       const response = await this.call<{ item: T }>('crm.item.get', {
        entityTypeId,
        id,
      });
      return response.result.item;
    } catch {
      return null;
    }
  }

  // Criar item
   async createItem<T extends CRMItem = CRMItem>(
     entityTypeId: number,
     fields: Record<string, unknown>
   ): Promise<{ id: number; item: T }> {
     const response = await this.call<{ item: T }>('crm.item.add', {
      entityTypeId,
      fields,
    });

    return {
      id: parseInt(response.result.item.ID),
      item: response.result.item,
    };
  }

  // Atualizar item
   async updateItem<T extends CRMItem = CRMItem>(
     entityTypeId: number,
     id: number | string,
     fields: Record<string, unknown>
   ): Promise<T> {
     const response = await this.call<{ item: T }>('crm.item.update', {
      entityTypeId,
      id,
      fields,
    });

    return response.result.item;
  }

  // Deletar item
  async deleteItem(entityTypeId: number, id: number | string): Promise<boolean> {
    try {
      await this.call<boolean>('crm.item.delete', { entityTypeId, id });
      return true;
    } catch {
      return false;
    }
  }

  // Mover item para outro estágio
  async moveToStage(
    entityTypeId: number,
    id: number | string,
    stageId: number
  ): Promise<CRMItem> {
    return this.updateItem(entityTypeId, id, { stageId });
  }

  // Batch call (até 50 comandos)
   async batch<T = unknown>(commands: Array<{ method: string; params?: Record<string, unknown> }>): Promise<T[]> {
     const cmd: Record<string, string> = {};
     
     commands.forEach((c, i) => {
       const searchParams = new URLSearchParams();
       if (c.params) {
         Object.entries(c.params).forEach(([key, value]) => {
           searchParams.append(key, String(value));
         });
       }
       const params = c.params ? `?${searchParams.toString()}` : '';
       cmd[`cmd${i}`] = `${c.method}${params}`;
     });
 
     interface BatchResult {
       result: Record<string, T>;
       result_error: Record<string, unknown>;
     }
 
     const response = await this.call<BatchResult>('batch', { cmd });
     return Object.values(response.result.result);
   }
}

// Instância padrão
export const bitrix24 = new Bitrix24Client();

// Helpers específicos para SPAs
export const lalamove = {
   async listMotoristas(filter?: Record<string, unknown>) {
    const { items } = await bitrix24.listItems(SPA_CONFIG.LALAMOVE.entityTypeId, {
      select: ['ID', ...Object.values(SPA_CONFIG.LALAMOVE.fields)],
      filter: { stageId: SPA_CONFIG.LALAMOVE.stages.AUTOMATICO, ...filter },
    });
    return items.map(item => ({
      id: item.ID,
      nome: item[SPA_CONFIG.LALAMOVE.fields.motorista],
      placa: item[SPA_CONFIG.LALAMOVE.fields.placa],
      contato: item[SPA_CONFIG.LALAMOVE.fields.contato],
    }));
  },

  async marcarACaminho(id: string | number) {
    return bitrix24.moveToStage(
      SPA_CONFIG.LALAMOVE.entityTypeId,
      id,
      SPA_CONFIG.LALAMOVE.stages.AUTOMATICO
    );
  },
};

export const expedicao = {
   async listRecebimentos(filter?: Record<string, unknown>) {
    const { items } = await bitrix24.listItems(SPA_CONFIG.EXPEDICAO.entityTypeId, {
      filter: { stageId: SPA_CONFIG.EXPEDICAO.stages.RECEBIMENTO, ...filter },
    });
    return items;
  },
};

export { Bitrix24Client };
export default bitrix24;
