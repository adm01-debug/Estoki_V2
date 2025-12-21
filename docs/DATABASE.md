# 🗄️ Estrutura de Banco de Dados

Este documento descreve a estrutura do banco de dados do ESTOKI no Supabase.

## Visão Geral

O ESTOKI utiliza PostgreSQL via Supabase com:
- **Tabelas** para dados estruturados
- **Edge Functions** para processamento serverless
- **Row Level Security (RLS)** para segurança
- **Realtime** para atualizações em tempo real

## Esquema de Tabelas

### 📦 Estoque

#### `produtos`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| sku | text | Código único |
| nome | text | Nome do produto |
| descricao | text | Descrição |
| categoria | text | Categoria |
| unidade | text | Unidade de medida |
| preco_custo | decimal | Preço de custo |
| estoque_minimo | int | Estoque mínimo |
| estoque_maximo | int | Estoque máximo |
| created_at | timestamp | Data criação |
| updated_at | timestamp | Última atualização |

#### `posicoes_estoque`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| codigo | text | Código da posição (ex: A-01-01) |
| corredor | text | Corredor |
| prateleira | text | Prateleira |
| nivel | int | Nível |
| tipo | text | Tipo (picking/pulmão) |
| capacidade | int | Capacidade máxima |
| ocupado | int | Quantidade ocupada |
| produto_id | uuid | FK produtos |

#### `movimentacoes`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| produto_id | uuid | FK produtos |
| tipo | text | entrada/saída/transferência |
| quantidade | int | Quantidade |
| posicao_origem | uuid | FK posicoes_estoque |
| posicao_destino | uuid | FK posicoes_estoque |
| motivo | text | Motivo |
| usuario_id | uuid | FK auth.users |
| created_at | timestamp | Data |

### 📥 Recebimento

#### `recebimentos`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| numero_nota | text | Número da NF |
| fornecedor | text | Fornecedor |
| data_prevista | date | Data prevista |
| data_recebimento | timestamp | Data real |
| status | text | Status |
| total_volumes | int | Total de volumes |
| total_itens | int | Total de itens |
| observacoes | text | Observações |

#### `itens_recebimento`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| recebimento_id | uuid | FK recebimentos |
| produto_id | uuid | FK produtos |
| quantidade_esperada | int | Qtd esperada |
| quantidade_recebida | int | Qtd recebida |
| status | text | Status do item |

### ✅ Triagem

#### `triagens`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| recebimento_id | uuid | FK recebimentos |
| produto_id | uuid | FK produtos |
| numero_lote | text | Número do lote |
| quantidade_total | int | Quantidade total |
| quantidade_aprovada | int | Qtd aprovada |
| quantidade_reprovada | int | Qtd reprovada |
| status | text | Status |
| triador_id | uuid | FK auth.users |
| tempo_triagem | int | Tempo em segundos |
| observacoes | text | Observações |
| created_at | timestamp | Data |

### 🔄 Trocas e Devoluções

#### `trocas_devolucoes`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| tipo | text | troca/devolução |
| pedido | text | Número do pedido |
| cliente | text | Cliente |
| produto | text | Produto |
| sku | text | SKU |
| quantidade | int | Quantidade |
| motivo | text | Motivo |
| status | text | Status |
| data_abertura | timestamp | Data abertura |
| data_fechamento | timestamp | Data fechamento |

## Edge Functions

### `scanner-ocr`
Processamento OCR de documentos com IA.

**Input:**
```json
{
  "image_base64": "string",
  "tipo_documento": "nf | etiqueta | auto"
}
```

**Output:**
```json
{
  "tipo_documento": "string",
  "textos_extraidos": ["string"],
  "dados_estruturados": {},
  "confianca": 0.95
}
```

### `alerta-divergencia-fornecedor`
Envia alertas sobre divergências em recebimentos.

**Input:**
```json
{
  "fornecedor_id": "uuid",
  "divergencia": {}
}
```

## Políticas RLS

### Padrão de Acesso
```sql
-- Usuários autenticados podem ver seus próprios dados
CREATE POLICY "Users can view own data"
  ON tabela FOR SELECT
  USING (auth.uid() = user_id);

-- Admins podem ver todos os dados
CREATE POLICY "Admins can view all"
  ON tabela FOR SELECT
  USING (is_admin());
```

## Índices

```sql
-- Índices de performance críticos
CREATE INDEX idx_produtos_sku ON produtos(sku);
CREATE INDEX idx_movimentacoes_produto ON movimentacoes(produto_id);
CREATE INDEX idx_movimentacoes_data ON movimentacoes(created_at);
CREATE INDEX idx_triagens_status ON triagens(status);
```

## Migrations

As migrations são gerenciadas pelo Supabase CLI:

```bash
# Criar nova migration
supabase migration new nome_migration

# Aplicar migrations
supabase db push

# Status das migrations
supabase db status
```
