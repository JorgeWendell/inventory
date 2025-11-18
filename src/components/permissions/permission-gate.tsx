"use client";

import { useEffect, useState, ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { hasPermission, hasAnyPermission, hasAllPermissions } from "@/lib/permissions";
import { UserRole } from "@/constants/user-roles";
import type { Permission } from "@/lib/permissions";

interface PermissionGateProps {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGateProps) {
  const session = authClient.useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userRole = mounted
    ? ((session.data?.user as any)?.role as UserRole | undefined)
    : undefined;

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(userRole, permission);
  } else if (permissions) {
    hasAccess = requireAll
      ? hasAllPermissions(userRole, permissions)
      : hasAnyPermission(userRole, permissions);
  }

  if (!mounted || !hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

