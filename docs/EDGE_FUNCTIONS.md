# Edge Functions ESTOKI WMS

## 📋 Catálogo de Funções

### Autenticação
| Função | Descrição |
|--------|-----------|
| auth-login | Login de usuários |
| auth-register | Registro de novos usuários |
| auth-verify-email | Verificação de email |

### Recebimento
| Função | Descrição |
|--------|-----------|
| receiving-create | Criar novo recebimento |
| receiving-confirm | Confirmar itens recebidos |
| receiving-putaway | Armazenar itens |

### Picking/Wave
| Função | Descrição |
|--------|-----------|
| wave-planning | Planejar ondas de separação |
| wave-release | Liberar onda para picking |
| picking-assign | Atribuir picker |
| picking-confirm | Confirmar coleta |

### Integrações
| Função | Descrição |
|--------|-----------|
| nfe-import | Importar NF-e |
| carrier-quote-* | Cotação de frete |

## 🚀 Deploy

```bash
supabase functions deploy <nome-funcao>
```

## 🔒 Variáveis de Ambiente

Configurar no Supabase Dashboard > Edge Functions > Secrets
