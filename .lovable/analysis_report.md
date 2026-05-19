# Relatório de Análise Técnica - Estoki WMS

**Data:** 19 de Maio de 2026  
**Status:** Versão 1.0 - Análise Exaustiva  
**Responsável:** Senior Back-End Developer AI

---

## 1. Sumário Executivo

O sistema Estoki WMS apresenta uma arquitetura moderna baseada em micro-serviços serverless (Supabase Edge Functions) e um frontend robusto em React. No entanto, o crescimento acelerado resultou em lacunas críticas de segurança, redundância de código e fragilidades em processos vitais como a importação de NF-e e integridade de transações de estoque.

**Principais Desafios:**
- **Segurança:** 48 vulnerabilidades detectadas no banco de dados e permissões excessivas em Edge Functions.
- **Confiabilidade:** Lógica crítica de importação de NF-e baseada em dados mockados em produção.
- **Manutenibilidade:** Fragmentação extrema de lógica (100+ Edge Functions) sem uma camada de abstração sólida.
- **Performance:** Degradação potencial devido a varreduras sequenciais (Seq Scans) em tabelas de alto volume.

---

## 2. Detalhamento por Categoria

### 2.1 Segurança (Severidade: ALTA)

**Problemas Identificados:**
1.  **Acesso Público (Anon):** Diversas funções `SECURITY DEFINER` estão expostas ao papel `anon`, permitindo que usuários não autenticados executem operações administrativas.
2.  **Políticas de RLS Permissivas:** Uso de `USING (true)` em tabelas sensíveis sem filtros adicionais de `auth.uid()`.
3.  **CORS Brittle:** Hardcoding de origens em `_shared/cors.ts` dificulta a escalabilidade e testes em ambientes efêmeros.
4.  **Vulnerabilidades de Dependências:** `axios` e `happy-dom` com vulnerabilidades críticas conhecidas.

**Recomendações:**
- Migrar funções sensíveis para `SECURITY INVOKER` ou restringir `EXECUTE` apenas a roles autenticadas.
- Revisar todas as políticas RLS para garantir o isolamento multi-tenant (se aplicável) ou baseado em perfil.
- Implementar gestão de segredos dinâmica para CORS.

### 2.2 Arquitetura e Lógica de Negócio (Severidade: ALTA)

**Problemas Identificados:**
1.  **Lógica "Mockada" em Produção:** A função `nfe-import` não processa o XML real; ela insere dados estáticos de exemplo no banco.
2.  **Falta de Atomicidade:** A transferência de estoque (`inventory-transfer`) simula transações via chamadas sequenciais no cliente Edge Function, o que pode causar inconsistência se uma falha ocorrer no meio do processo.
3.  **Fragmentação de Funções:** Mais de 100 funções individuais aumentam o cold start e a complexidade de deploy/monitoramento.

**Recomendações:**
- Implementar um parser real de XML para NF-e/CT-e.
- Migrar operações críticas de estoque para **Stored Procedures (RPC)** no PostgreSQL para garantir transações ACID.
- Consolidar funções similares em módulos maiores (ex: `inventory-ops`, `auth-ops`).

### 2.3 Performance (Severidade: MÉDIA)

**Problemas Identificados:**
- **Seq Scans Elevados:** Tabelas como `tarefas`, `alertas_historico` e `notificacoes` estão sendo lidas integralmente com frequência.
- **Ausência de Índices:** Colunas usadas em filtros de busca e ordenação em tabelas de log/histórico não possuem índices.

**Recomendações:**
- Criar índices B-Tree em colunas de ID e Timestamps.
- Implementar índices GIN em colunas JSONB de metadados.

### 2.4 Qualidade e Testes (Severidade: MÉDIA)

**Problemas Identificados:**
- **Baixa Cobertura:** Menos de 5% das Edge Functions possuem testes unitários ou de contrato.
- **Validação de Schema Incompleta:** Embora exista o `_shared/schemas.ts`, muitas funções não o utilizam de forma rigorosa.

**Recomendações:**
- Implementar testes de contrato automatizados usando Deno Test para todas as funções críticas.
- Tornar o uso do Zod obrigatório em todos os entrypoints de funções.

---

## 3. Roadmap de Melhorias (Prioritário)

1.  **[CRÍTICO] Correção de Segurança (Linter):** Sanar os 48 avisos do linter do Supabase.
2.  **[CRÍTICO] Atomicidade de Estoque:** Converter a lógica de `inventory-transfer` para RPC SQL.
3.  **[IMPORTANTE] NF-e Real:** Implementar o processamento real de arquivos XML.
4.  **[MÉDIA] Indexação:** Aplicar índices nas tabelas identificadas com alto Seq Scan.

---

## 4. Benchmarking

Comparado a sistemas WMS Tier-1, o Estoki se destaca pela interface moderna e uso de IA, mas carece da robustez transacional necessária para operações de larga escala. A transição para Stored Procedures em operações de core-business é o padrão da indústria para garantir integridade.

---
*Relatório gerado automaticamente para fins de melhoria contínua.*
