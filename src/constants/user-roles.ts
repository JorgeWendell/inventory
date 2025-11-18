export type UserRole =
  | "VIEWER"
  | "OPERATOR"
  | "PURCHASER"
  | "AUDITOR"
  | "ADMINISTRATOR";

export const userRoles: UserRole[] = [
  "VIEWER",
  "OPERATOR",
  "PURCHASER",
  "AUDITOR",
  "ADMINISTRATOR",
];

export const userRoleLabels: Record<UserRole, string> = {
  VIEWER: "Visualizador",
  OPERATOR: "Operador",
  PURCHASER: "Compras",
  AUDITOR: "Auditor",
  ADMINISTRATOR: "Administrador",
};

export const userRoleDescriptions: Record<UserRole, string> = {
  VIEWER: "Acesso somente leitura ao dashboard",
  OPERATOR: "Acesso completo a estoque, inventário e solicitações",
  PURCHASER: "Acesso a solicitações de compra e visualização de estoque",
  AUDITOR: "Acesso somente aos logs do sistema",
  ADMINISTRATOR: "Acesso total ao sistema",
};

