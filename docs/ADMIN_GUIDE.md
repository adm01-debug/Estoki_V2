# 🔧 Guia do Administrador - ESTOKI

## Visão Geral

Este guia fornece instruções para administradores do sistema ESTOKI.

## Acesso Administrativo

### Níveis de Acesso
- **Super Admin**: Acesso total ao sistema
- **Admin**: Gerenciamento de usuários e configurações
- **Operador**: Acesso às operações diárias
- **Visualizador**: Apenas leitura

### Gerenciamento de Usuários
1. Acesse **Configurações > Usuários**
2. Clique em **Novo Usuário**
3. Preencha os dados e defina o nível de acesso
4. O usuário receberá um email de ativação

## Configurações do Sistema

### Configurações Gerais
- **Nome da Empresa**: Personaliza o sistema
- **Fuso Horário**: Define horário padrão
- **Idioma**: Português (padrão)

### Configurações de Estoque
- **Alerta de Estoque Mínimo**: Define threshold
- **Método de Valoração**: PEPS, UEPS, Média
- **Contagem Cíclica**: Frequência automática

### Configurações de Notificação
- **Email**: Alertas por email
- **Push**: Notificações no navegador
- **Slack**: Integração com Slack

## Backup e Recuperação

### Backup Automático
- Backups diários às 02:00
- Retenção de 30 dias
- Armazenamento no Supabase Storage

### Backup Manual
```bash
npm run backup
```

### Restauração
1. Acesse **Configurações > Backup**
2. Selecione o backup desejado
3. Clique em **Restaurar**

## Monitoramento

### Logs do Sistema
- Localização: Dashboard > Logs
- Filtros: Data, Tipo, Usuário
- Exportação: CSV, JSON

### Métricas de Performance
- Tempo de resposta médio
- Uso de CPU/Memória
- Erros por minuto

### Alertas
- Configurados em **Configurações > Alertas**
- Tipos: Email, Slack, SMS
- Gatilhos personalizáveis

## Integrações

### Supabase
- URL: Variável de ambiente
- Chaves: Rotacionar a cada 90 dias
- RLS: Sempre ativo

### APIs Externas
- Rate limiting: 100 req/min
- Timeout: 30 segundos
- Retry: 3 tentativas

## Segurança

### Políticas de Senha
- Mínimo 8 caracteres
- Letras, números e símbolos
- Expiração: 90 dias

### Autenticação
- 2FA disponível
- Session timeout: 8 horas
- Bloqueio após 5 tentativas

### Auditoria
- Logs de acesso
- Histórico de alterações
- Relatórios de segurança

## Manutenção

### Tarefas Diárias
- [ ] Verificar logs de erro
- [ ] Monitorar performance
- [ ] Revisar alertas

### Tarefas Semanais
- [ ] Revisar backups
- [ ] Atualizar documentação
- [ ] Verificar integrações

### Tarefas Mensais
- [ ] Rotacionar credenciais
- [ ] Revisar acessos
- [ ] Atualizar dependências

## Troubleshooting

### Erros Comuns
| Erro | Causa | Solução |
|------|-------|---------|
| 401 | Token expirado | Fazer login novamente |
| 403 | Sem permissão | Verificar nível de acesso |
| 500 | Erro interno | Verificar logs |

### Suporte
- Email: suporte@estoki.com
- Docs: /docs
- Issues: GitHub Issues

---
*Atualizado em Dezembro 2025*
