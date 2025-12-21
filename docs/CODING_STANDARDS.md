# Coding Standards

## TypeScript
- Use strict mode
- Prefer interfaces over types for objects
- Use enums for fixed sets of values
- Always type function parameters and returns

## React
- Functional components only
- Use hooks for state and effects
- Memoize expensive computations
- Keep components small (<200 lines)

## Naming
- Components: PascalCase
- Files: kebab-case or PascalCase for components
- Variables: camelCase
- Constants: SCREAMING_SNAKE_CASE
- Types/Interfaces: PascalCase

## File Structure
```
src/
  components/    # Reusable components
  pages/         # Route components
  hooks/         # Custom hooks
  services/      # API services
  utils/         # Utilities
  types/         # Type definitions
  lib/           # Third-party integrations
```

## Testing
- Unit test all utilities
- Test hooks with renderHook
- E2E test critical paths
- Aim for 80% coverage
