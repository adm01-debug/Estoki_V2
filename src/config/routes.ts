import { lazy } from "react";

export const routes = [
  { path: "/", component: lazy(() => import("@/pages/Index")), name: "Home" },
  { path: "/dashboard", component: lazy(() => import("@/pages/Dashboard")), name: "Dashboard" },
  { path: "/estoque", component: lazy(() => import("@/pages/Estoque")), name: "Estoque" },
  { path: "/triagem", component: lazy(() => import("@/pages/Triagem")), name: "Triagem" },
  { path: "/recebimento", component: lazy(() => import("@/pages/ConferenciaRecebimento")), name: "Recebimento" },
  { path: "/movimentacao", component: lazy(() => import("@/pages/Movimentacao")), name: "Movimentação" },
  { path: "/relatorios", component: lazy(() => import("@/pages/Relatorios")), name: "Relatórios" },
  { path: "/configuracoes", component: lazy(() => import("@/pages/Configuracoes")), name: "Configurações" },
  { path: "/auth", component: lazy(() => import("@/pages/Auth")), name: "Login", public: true },
];

export const publicRoutes = routes.filter(r => r.public);
export const protectedRoutes = routes.filter(r => !r.public);
