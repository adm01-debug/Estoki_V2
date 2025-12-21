# Guia do Administrador - ESTOKI

## Configuração Inicial

### 1. Variáveis de Ambiente
```bash
VITE_SUPABASE_URL=xxx
VITE_SUPABASE_ANON_KEY=xxx
```

### 2. Supabase Setup
- Criar projeto
- Executar migrations
- Configurar RLS

### 3. Usuários
- Criar admin inicial via SQL
- Definir permissões

## Manutenção

### Backups
- Supabase faz backup automático
- Exportar dados mensalmente

### Monitoramento
- Verificar logs diariamente
- Monitorar uso de storage

### Atualizações
```bash
git pull origin main
npm install
npm run build
```

## Permissões

| Role | Acesso |
|------|--------|
| admin | Tudo |
| supervisor | Leitura + Escrita |
| operador | Módulos específicos |
| visualizador | Apenas leitura |

## Troubleshooting

Ver `docs/TROUBLESHOOTING.md`
