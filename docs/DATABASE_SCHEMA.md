# 🗄️ Schema do Banco de Dados - ESTOKI

## Visão Geral
- **Engine**: PostgreSQL (Supabase)
- **Total de Tabelas**: 33
- **RLS**: Ativo em todas as tabelas

## Tabelas Principais

### profiles
Perfis de usuários
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK, ref auth.users |
| nome | text | Nome completo |
| avatar_url | text | URL do avatar |
| cargo | text | Cargo/função |

### posicoes_estoque
Posições de armazenamento
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| codigo | text | Código único |
| tipo | text | Tipo (pallet, prateleira) |
| status | text | disponivel, ocupada, bloqueada |
| capacidade_max | integer | Capacidade máxima |

### lotes
Lotes de produtos
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| numero_lote | text | Número do lote |
| produto_id | uuid | FK produtos |
| quantidade | integer | Quantidade |
| data_validade | date | Validade |

### eventos_triagem
Eventos de triagem
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| lote_id | uuid | FK lotes |
| tipo | text | Tipo do evento |
| usuario_id | uuid | FK profiles |
| resultado | jsonb | Dados da triagem |

### rastreamento_historico
Histórico de movimentações
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| tipo_evento | text | Tipo da movimentação |
| lote_id | uuid | FK lotes |
| posicao_origem | text | Origem |
| posicao_destino | text | Destino |

## Tabelas de Gamificação

### gamificacao_usuarios
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| user_id | uuid | PK, FK profiles |
| xp_total | integer | XP acumulado |
| nivel | integer | Nível atual |

### conquistas_usuarios
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| user_id | uuid | FK profiles |
| conquista_id | uuid | FK conquistas_definicoes |

### desafios_diarios
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| data | date | Data do desafio |
| tipo | text | Tipo do desafio |
| meta | integer | Meta a atingir |

## Diagrama ER (Simplificado)

```
profiles ──────┬──── gamificacao_usuarios
               │
               ├──── conquistas_usuarios
               │
               └──── eventos_triagem ──── lotes ──── produtos
                                           │
                                           └──── posicoes_estoque
```

## Índices

```sql
CREATE INDEX idx_lotes_numero ON lotes(numero_lote);
CREATE INDEX idx_posicoes_codigo ON posicoes_estoque(codigo);
CREATE INDEX idx_eventos_data ON eventos_triagem(created_at);
```

---
*Sincronizado com types.ts em Dezembro 2025*
