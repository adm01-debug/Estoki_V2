export type AppRoleValue = "operador" | "supervisor" | "admin";

const ROLE_PRIORITY: Record<AppRoleValue, number> = {
  operador: 1,
  supervisor: 2,
  admin: 3,
};

/**
 * Um usuario pode ter a mesma role em varios tenants (WMS-9 fase 3), entao a
 * consulta pode devolver N linhas. A UI mostra a de maior poder.
 */
export function highestRole(roles: readonly (string | null | undefined)[]): AppRoleValue | null {
  let best: AppRoleValue | null = null;
  for (const r of roles) {
    if (!r || !(r in ROLE_PRIORITY)) continue;
    const role = r as AppRoleValue;
    if (best === null || ROLE_PRIORITY[role] > ROLE_PRIORITY[best]) best = role;
  }
  return best;
}
