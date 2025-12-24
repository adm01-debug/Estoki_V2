# Internationalization (i18n) - ESTOKI WMS

## Idiomas Suportados

- 🇧🇷 Português (pt-BR) - Padrão
- 🇺🇸 English (en-US)
- 🇪🇸 Español (es)

## Estrutura

```
src/i18n/
├── index.ts
└── locales/
    ├── pt-BR.json
    ├── en-US.json
    └── es.json
```

## Uso

```typescript
import { useTranslation } from '@/i18n';

const { t } = useTranslation();
return <span>{t('common.save')}</span>;
```

## Adicionar Novo Idioma

1. Criar arquivo em `locales/`
2. Traduzir todas as chaves
3. Registrar em `index.ts`
