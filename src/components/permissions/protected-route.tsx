"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { canAccessRoute } from "@/lib/permissions";
import { UserRole } from "@/constants/user-roles";

interface ProtectedRouteProps {
  children: React.ReactNode;
  route: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  route,
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter();
  const session = authClient.useSession();
  const userRole = (session.data?.user as any)?.role as UserRole | undefined;

  useEffect(() => {
    if (session.isPending) return;

    if (!session.data?.user) {
      router.push("/authentication");
      return;
    }

    if (!canAccessRoute(userRole, route)) {
      router.push("/dashboard");
    }
  }, [session, userRole, route, router]);

  if (session.isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!session.data?.user) {
    return null;
  }

  if (!canAccessRoute(userRole, route)) {
    return (
      <>
        {fallback || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
              <p className="text-muted-foreground">
                Você não tem permissão para acessar esta página.
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}

