# Database Schema

## Tables

### posicoes
- id (UUID, PK)
- codigo (TEXT, UNIQUE)
- corredor (TEXT)
- prateleira (TEXT)
- nivel (TEXT)
- tipo (TEXT)
- status (TEXT)
- capacidade_max (INT)
- ocupacao_atual (INT)
- created_at (TIMESTAMPTZ)

### triagens
- id (UUID, PK)
- lote_id (TEXT)
- operador_id (UUID, FK)
- status (TEXT)
- quantidade_total (INT)
- quantidade_aprovada (INT)
- quantidade_reprovada (INT)
- observacoes (TEXT)
- fotos (TEXT[])
- inicio (TIMESTAMPTZ)
- fim (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)

### recebimentos
- id (UUID, PK)
- nf_numero (TEXT)
- fornecedor_id (TEXT)
- status (TEXT)
- conferente_id (UUID, FK)
- data_prevista (DATE)
- data_recebimento (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)

### movimentacoes
- id (UUID, PK)
- tipo (TEXT)
- produto_id (TEXT)
- origem_id (UUID, FK)
- destino_id (UUID, FK)
- quantidade (INT)
- operador_id (UUID, FK)
- motivo (TEXT)
- created_at (TIMESTAMPTZ)
