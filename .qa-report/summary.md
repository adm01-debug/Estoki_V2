## 🧪 QA Report

| Verificação | Status |
| --- | :---: |
| Lint (ESLint) | ✅ success |
| Type-check (tsc) | ✅ success |
| Testes unitários (Vitest) | ✅ success |
| Build (Vite) | ✅ success |
| Budget de bundle (size-limit) | ✅ success |
| Auditoria RLS | ✅ success |
| Segurança (npm audit) | ⏭️ skipped |

<details><summary>rls-audit.md</summary>

# RLS Audit

- Tabelas ativas em `public`: **75**
- Sem RLS habilitado: **0**
- Sem policy: **0**

✅ Todas as tabelas públicas têm RLS habilitado e ao menos uma policy.

</details>
