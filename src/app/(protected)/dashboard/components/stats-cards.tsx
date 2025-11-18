"use client";

import { useEffect, useState } from "react";
import {
  Computer,
  Monitor,
  Package,
  Power,
  Printer,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { hasPermission } from "@/lib/permissions";
import { UserRole } from "@/constants/user-roles";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardsProps {
  totais: {
    computadores: number;
    monitores: number;
    nobreaks: number;
    toners: number;
    materiais: number;
  };
  solicitacoesPendentes: number;
  pedidosPendentes: number;
  estoquesBaixos: number;
}

const StatsCards = ({
  totais,
  solicitacoesPendentes,
  pedidosPendentes,
  estoquesBaixos,
}: StatsCardsProps) => {
  const session = authClient.useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userRole = mounted
    ? ((session.data?.user as any)?.role as UserRole | undefined)
    : undefined;

  const canAccess = (permission: string) => {
    return hasPermission(userRole, permission as any);
  };

  const cards = [
    {
      title: "Computadores",
      value: totais.computadores,
      icon: Computer,
      href: "/inventario/computadores",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Monitores",
      value: totais.monitores,
      icon: Monitor,
      href: "/inventario/monitores",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Nobreaks",
      value: totais.nobreaks,
      icon: Power,
      href: "/inventario/nobreaks",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
    },
    {
      title: "Toners",
      value: totais.toners,
      icon: Printer,
      href: "/inventario/toners",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "Materiais de TI",
      value: totais.materiais,
      icon: Package,
      href: "/estoque/materiais-de-ti",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      title: "Solicitações Pendentes",
      value: solicitacoesPendentes,
      icon: ShoppingCart,
      href: "/solicitacoes/solicitacao-de-compra",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
      alert: solicitacoesPendentes > 0,
    },
    {
      title: "Pedidos Pendentes",
      value: pedidosPendentes,
      icon: ShoppingCart,
      href: "/solicitacoes/pedido-interno",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950",
      alert: pedidosPendentes > 0,
    },
    {
      title: "Estoques Baixos",
      value: estoquesBaixos,
      icon: Package,
      href: "/estoque/materiais-de-ti",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
      alert: estoquesBaixos > 0,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const hasAccess = canAccess(
          card.href.startsWith("/estoque")
            ? "estoque.view"
            : card.href.startsWith("/inventario")
              ? "inventario.view"
              : card.href.startsWith("/solicitacoes")
                ? "solicitacoes.view"
                : "dashboard.view",
        );

        const cardElement = (
          <Card
            className={`transition-all ${
              hasAccess ? "hover:shadow-md cursor-pointer" : "opacity-60"
            } ${card.alert ? "border-red-500" : ""}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              {card.alert && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  Atenção necessária
                </p>
              )}
              {!hasAccess && (
                <p className="text-xs text-muted-foreground mt-1">
                  Sem permissão de acesso
                </p>
              )}
            </CardContent>
          </Card>
        );

        return hasAccess ? (
          <Link key={card.title} href={card.href}>
            {cardElement}
          </Link>
        ) : (
          <div key={card.title}>{cardElement}</div>
        );
      })}
    </div>
  );
};

export default StatsCards;

