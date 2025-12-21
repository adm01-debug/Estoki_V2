# Development Setup

## Quick Start
```bash
git clone https://github.com/adm01-debug/estoki.git
cd estoki
npm install
cp .env.example .env
npm run dev
```

## Supabase Local
```bash
npx supabase start
npx supabase db reset
```

## Testing
```bash
npm test              # Unit tests
npm run test:e2e      # E2E tests
npm run test:coverage # Coverage report
```

## Code Quality
```bash
npm run lint          # ESLint
npm run type-check    # TypeScript
npm run format        # Prettier
```

## Branch Strategy
- `main` - Production
- `develop` - Development
- `feature/*` - New features
- `fix/*` - Bug fixes
