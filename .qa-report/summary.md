## 🧪 QA Report

| Verificação | Status |
| --- | :---: |
| Lint (ESLint) | ✅ success |
| Type-check (tsc) | ❌ failure |
| Testes unitários (Vitest) | ✅ success |
| Build (Vite) | ✅ success |
| Budget de bundle (size-limit) | ❌ failure |
| Auditoria RLS | ✅ success |
| Segurança (npm audit) | ⏭️ skipped |

<details><summary>rls-audit.md</summary>

# RLS Audit

- Tabelas ativas em `public`: **76**
- Sem RLS habilitado: **1**
- Sem policy: **1**

## ❌ Tabelas sem `ENABLE ROW LEVEL SECURITY`
- `public.tabela_insegura_teste`

## ⚠️ Tabelas sem `CREATE POLICY`
- `public.tabela_insegura_teste`


</details>
