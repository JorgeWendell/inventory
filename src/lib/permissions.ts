import { UserRole } from "@/constants/user-roles";

export type Permission =
  | "dashboard.view"
  | "dashboard.actions"
  | "estoque.view"
  | "estoque.edit"
  | "inventario.view"
  | "inventario.edit"
  | "inventario.delete"
  | "pedidos.view"
  | "pedidos.create"
  | "solicitacoes.view"
  | "solicitacoes.manage"
  | "relatorios.view"
  | "logs.view"
  | "users.manage";

const rolePermissions: Record<UserRole, Permission[]> = {
  VIEWER: [
    "dashboard.view",
    "estoque.view",
    "inventario.view",
    "pedidos.view",
    "solicitacoes.view",
    "relatorios.view",
  ],
  OPERATOR: [
    "dashboard.view",
    "dashboard.actions",
    "estoque.view",
    "estoque.edit",
    "inventario.view",
    "inventario.edit",
    "pedidos.view",
    "pedidos.create",
    "solicitacoes.view",
    "relatorios.view",
  ],
  PURCHASER: [
    "dashboard.view",
    "estoque.view",
    "solicitacoes.view",
    "solicitacoes.manage",
    "relatorios.view",
  ],
  AUDITOR: [
    "dashboard.view",
    "logs.view",
    "estoque.view",
    "inventario.view",
    "pedidos.view",
    "solicitacoes.view",
    "relatorios.view",
  ],
  ADMINISTRATOR: [
    "dashboard.view",
    "dashboard.actions",
    "estoque.view",
    "estoque.edit",
    "inventario.view",
    "inventario.edit",
    "inventario.delete",
    "pedidos.view",
    "pedidos.create",
    "solicitacoes.view",
    "solicitacoes.manage",
    "relatorios.view",
    "logs.view",
    "users.manage",
  ],
};

export function hasPermission(
  userRole: UserRole | null | undefined,
  permission: Permission,
): boolean {
  if (!userRole) return false;
  return rolePermissions[userRole]?.includes(permission) ?? false;
}

export function hasAnyPermission(
  userRole: UserRole | null | undefined,
  permissions: Permission[],
): boolean {
  if (!userRole) return false;
  return permissions.some((permission) => hasPermission(userRole, permission));
}

export function hasAllPermissions(
  userRole: UserRole | null | undefined,
  permissions: Permission[],
): boolean {
  if (!userRole) return false;
  return permissions.every((permission) => hasPermission(userRole, permission));
}

export function canAccessRoute(
  userRole: UserRole | null | undefined,
  route: string,
): boolean {
  if (!userRole) return false;

  // Rotas públicas (dashboard sempre acessível)
  if (route === "/dashboard") {
    return hasPermission(userRole, "dashboard.view");
  }

  // Rotas de estoque
  if (route.startsWith("/estoque")) {
    return hasPermission(userRole, "estoque.view");
  }

  // Rotas de inventário
  if (route.startsWith("/inventario")) {
    return hasPermission(userRole, "inventario.view");
  }

  // Rotas de pedidos internos
  if (route.startsWith("/solicitacoes/pedido-interno")) {
    return hasPermission(userRole, "pedidos.view");
  }

  // Rotas de solicitações de compra
  if (route.startsWith("/solicitacoes/solicitacao-de-compra")) {
    return hasPermission(userRole, "solicitacoes.view");
  }

  // Rotas de relatórios
  if (route.startsWith("/relatorios")) {
    return hasPermission(userRole, "relatorios.view");
  }

  // Rotas de logs
  if (route.startsWith("/logs")) {
    return hasPermission(userRole, "logs.view");
  }

  // Rotas de notificações (todos podem ver suas notificações)
  if (route.startsWith("/notificacoes")) {
    return true;
  }

  // Rotas de usuários (apenas admin)
  if (route.startsWith("/sistema/usuarios")) {
    return hasPermission(userRole, "users.manage");
  }

  return false;
}

