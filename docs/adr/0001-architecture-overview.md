 # ADR 0001: Visão Geral da Arquitetura ESTOKI
 
 ## Status
 Aceito
 
 ## Contexto
 Necessidade de um sistema WMS escalável, performático e seguro utilizando stack moderna.
 
 ## Decisões
 1. **Framework:** React com Vite para build rápido e DX superior.
 2. **State Management:** React Query para server-state e Context API para UI-state.
 3. **Backend:** Supabase (PostgreSQL + PostgREST + Auth + Edge Functions) para redução de overhead de infraestrutura.
 4. **Styling:** Tailwind CSS + Shadcn UI para consistência visual e velocidade de desenvolvimento.
 5. **Performance:** Lazy loading de rotas e componentes pesados (Recharts) por padrão.
 
 ## Consequências
 - Redução do bundle size inicial.
 - Segurança baseada em RLS (Row Level Security).
 - Facilidade de manutenção através de hooks customizados e separação de interesses.