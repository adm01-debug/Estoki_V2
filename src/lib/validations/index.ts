import { z } from 'zod';

// ===================== Estoque =====================
export const estoqueSchema = z.object({
  codigo: z.string().min(1, 'Código obrigatório').max(50),
  descricao: z.string().min(1, 'Descrição obrigatória').max(500),
  quantidade: z.number().min(0, 'Quantidade deve ser >= 0'),
  unidade: z.string().min(1, 'Unidade obrigatória').max(10),
});

// ===================== Triagem =====================
export const triagemSchema = z.object({
  lote: z.string().min(1, 'Lote obrigatório'),
  quantidade_total: z.number().min(1, 'Quantidade deve ser > 0'),
  tipo_triagem: z.enum(['completa', 'amostragem']),
});

// ===================== Recebimento =====================
export const recebimentoSchema = z.object({
  nota_fiscal: z.string().min(1, 'NF obrigatória').max(100),
  fornecedor: z.string().min(1, 'Fornecedor obrigatório').max(200),
  data_recebimento: z.string().datetime(),
});

// ===================== Usuário =====================
export const usuarioSchema = z.object({
  email: z.string().email('Email inválido').max(255),
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  cargo: z.string().max(100).optional(),
});

// ===================== Produto =====================
export const produtoSchema = z.object({
  sku: z.string().min(1, 'SKU obrigatório').max(50),
  nome: z.string().min(1, 'Nome obrigatório').max(200),
  descricao: z.string().max(1000).optional().nullable(),
  unidade: z.string().max(10).default('UN'),
  peso_unitario: z.number().min(0).optional().nullable(),
  volume_unitario: z.number().min(0).optional().nullable(),
  estoque_minimo: z.number().int().min(0).default(0),
  estoque_maximo: z.number().int().min(0).optional().nullable(),
  ponto_pedido: z.number().int().min(0).default(0),
  curva_abc: z.enum(['A', 'B', 'C']).default('C'),
  fornecedor_principal: z.string().max(200).optional().nullable(),
});

// ===================== Lote =====================
export const loteSchema = z.object({
  numero_lote: z.string().min(1, 'Número do lote obrigatório').max(100),
  produto_id: z.string().uuid('ID do produto inválido'),
  quantidade_inicial: z.number().int().min(1, 'Quantidade deve ser > 0'),
  quantidade_atual: z.number().int().min(0),
  fornecedor: z.string().max(200).optional().nullable(),
  nf_entrada: z.string().max(100).optional().nullable(),
  data_fabricacao: z.string().optional().nullable(),
  data_validade: z.string().optional().nullable(),
  pedido_compra: z.string().max(100).optional().nullable(),
});

// ===================== Posição de Estoque =====================
export const posicaoEstoqueSchema = z.object({
  codigo: z.string().min(1, 'Código obrigatório').max(50),
  tipo: z.enum(['pallet', 'prateleira', 'box', 'chao', 'mezanino']),
  zona: z.string().max(20).optional().nullable(),
  porta_palete: z.string().max(20).optional().nullable(),
  secao: z.string().max(20).optional().nullable(),
  nivel: z.string().max(20).optional().nullable(),
  box: z.string().max(20).optional().nullable(),
  capacidade_kg: z.number().min(0).default(500),
});

// ===================== Tarefa =====================
export const tarefaSchema = z.object({
  tipo: z.enum(['separacao', 'armazenamento', 'reposicao', 'inventario', 'transferencia']),
  prioridade: z.enum(['baixa', 'media', 'alta', 'urgente']).default('media'),
  produto_id: z.string().uuid().optional().nullable(),
  posicao_origem_id: z.string().uuid().optional().nullable(),
  posicao_destino_id: z.string().uuid().optional().nullable(),
  quantidade: z.number().int().min(1, 'Quantidade deve ser > 0'),
  zona: z.string().max(20).optional().nullable(),
  instrucoes: z.string().max(1000).optional().nullable(),
});

// ===================== Romaneio =====================
export const romaneioSchema = z.object({
  codigo: z.string().min(1, 'Código obrigatório').max(50),
  motorista: z.string().max(200).optional().nullable(),
  placa_veiculo: z.string().max(20).optional().nullable(),
  tipo_veiculo: z.string().max(50).optional().nullable(),
  rota: z.string().max(200).optional().nullable(),
  data_prevista_entrega: z.string().optional().nullable(),
  observacoes: z.string().max(1000).optional().nullable(),
});

// ===================== Item Romaneio =====================
export const romaneioItemSchema = z.object({
  romaneio_id: z.string().uuid('ID do romaneio inválido'),
  cliente: z.string().min(1, 'Cliente obrigatório').max(200),
  endereco_entrega: z.string().min(1, 'Endereço obrigatório').max(500),
  quantidade: z.number().int().min(1).default(1),
  peso_kg: z.number().min(0).optional().nullable(),
  contato_cliente: z.string().max(200).optional().nullable(),
  telefone_cliente: z.string().max(20).optional().nullable(),
  pedido_referencia: z.string().max(100).optional().nullable(),
  nf_saida: z.string().max(100).optional().nullable(),
  observacoes: z.string().max(1000).optional().nullable(),
});

// ===================== Troca/Devolução =====================
export const trocaDevolucaoSchema = z.object({
  tipo: z.enum(['troca', 'devolucao']),
  pedido: z.string().min(1, 'Pedido obrigatório').max(100),
  cliente: z.string().min(1, 'Cliente obrigatório').max(200),
  produto: z.string().min(1, 'Produto obrigatório').max(200),
  quantidade: z.number().int().min(1, 'Quantidade deve ser > 0'),
  motivo: z.enum(['defeito', 'cor_errada', 'tamanho_errado', 'produto_errado', 'qualidade', 'outro']),
  descricao_problema: z.string().max(2000).optional().nullable(),
  fornecedor: z.string().max(200).optional().nullable(),
  sku: z.string().max(50).optional().nullable(),
  valor_unitario: z.number().min(0).optional().nullable(),
});

// ===================== Alerta =====================
export const alertaSchema = z.object({
  titulo: z.string().min(1, 'Título obrigatório').max(200),
  mensagem: z.string().min(1, 'Mensagem obrigatória').max(1000),
  tipo: z.enum(['estoque_baixo', 'vencimento_proximo', 'divergencia', 'posicao_ociosa', 'ponto_pedido', 'ruptura']),
  severidade: z.enum(['info', 'aviso', 'critico']),
});

// ===================== Inventário Ciclo =====================
export const inventarioCicloSchema = z.object({
  nome: z.string().min(1, 'Nome obrigatório').max(200),
  data_agendada: z.string().min(1, 'Data obrigatória'),
  tipo: z.string().default('ciclico'),
  zona_alvo: z.string().max(20).optional().nullable(),
  porta_palete_alvo: z.string().max(20).optional().nullable(),
  descricao: z.string().max(1000).optional().nullable(),
});

// Exports de tipos inferidos
export type Estoque = z.infer<typeof estoqueSchema>;
export type Triagem = z.infer<typeof triagemSchema>;
export type Recebimento = z.infer<typeof recebimentoSchema>;
export type Usuario = z.infer<typeof usuarioSchema>;
export type Produto = z.infer<typeof produtoSchema>;
export type Lote = z.infer<typeof loteSchema>;
export type PosicaoEstoque = z.infer<typeof posicaoEstoqueSchema>;
export type Tarefa = z.infer<typeof tarefaSchema>;
export type Romaneio = z.infer<typeof romaneioSchema>;
export type RomaneioItem = z.infer<typeof romaneioItemSchema>;
export type TrocaDevolucao = z.infer<typeof trocaDevolucaoSchema>;
export type Alerta = z.infer<typeof alertaSchema>;
export type InventarioCiclo = z.infer<typeof inventarioCicloSchema>;
