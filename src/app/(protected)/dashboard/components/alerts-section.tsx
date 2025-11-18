"use client";

import { AlertTriangle, Package, ShoppingCart } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EstoqueBaixo {
  id: string;
  nome: string;
  categoria: string;
  estoqueAtual: number;
  estoqueMin: number;
  localidade: string;
}

interface SolicitacaoPendente {
  id: string;
  tipoProduto: string;
  quantidade: number;
  status: string;
  createdAt: string;
}

interface PedidoPendente {
  id: string;
  tipoProduto: string;
  quantidade: number;
  status: string;
  createdAt: string;
}

interface AlertsSectionProps {
  estoquesBaixos: EstoqueBaixo[];
  solicitacoesPendentes: SolicitacaoPendente[];
  pedidosPendentes: PedidoPendente[];
}

const AlertsSection = ({
  estoquesBaixos,
  solicitacoesPendentes,
  pedidosPendentes,
}: AlertsSectionProps) => {
  const formatDateBR = (dateString: string): string => {
    const date = new Date(dateString);
    const offset = -3 * 60;
    const localDate = new Date(
      date.getTime() + (offset - date.getTimezoneOffset()) * 60000,
    );
    return localDate.toLocaleDateString("pt-BR");
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Estoques Baixos */}
      <Card className="border-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Estoques Baixos
            {estoquesBaixos.length > 0 && (
              <span className="ml-auto rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 dark:bg-red-900 dark:text-red-200">
                {estoquesBaixos.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {estoquesBaixos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum estoque baixo no momento
            </p>
          ) : (
            <div className="space-y-3">
              {estoquesBaixos.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-red-900 dark:text-red-100">
                        {item.nome}
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-300">
                        {item.categoria} • {item.localidade}
                      </p>
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        Estoque: {item.estoqueAtual} / Mínimo: {item.estoqueMin}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {estoquesBaixos.length > 5 && (
                <Link href="/estoque/materiais-de-ti">
                  <Button variant="outline" size="sm" className="w-full">
                    Ver todos ({estoquesBaixos.length})
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Solicitações Pendentes */}
      <Card className="border-yellow-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShoppingCart className="h-5 w-5 text-yellow-600" />
            Solicitações Pendentes
            {solicitacoesPendentes.length > 0 && (
              <span className="ml-auto rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                {solicitacoesPendentes.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {solicitacoesPendentes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma solicitação pendente
            </p>
          ) : (
            <div className="space-y-3">
              {solicitacoesPendentes.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-yellow-700 dark:text-yellow-300">
                        {item.tipoProduto === "MATERIAL_TI"
                          ? "Material de TI"
                          : "Toner"}
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">
                        Qtd: {item.quantidade} • {formatDateBR(item.createdAt)}
                      </p>
                      <p className="mt-1 text-xs font-medium text-yellow-800 dark:text-yellow-200">
                        Status: {item.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {solicitacoesPendentes.length > 5 && (
                <Link href="/solicitacoes/solicitacao-de-compra">
                  <Button variant="outline" size="sm" className="w-full">
                    Ver todos ({solicitacoesPendentes.length})
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pedidos Pendentes */}
      <Card className="border-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5 text-blue-600" />
            Pedidos Pendentes
            {pedidosPendentes.length > 0 && (
              <span className="ml-auto rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {pedidosPendentes.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pedidosPendentes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum pedido pendente
            </p>
          ) : (
            <div className="space-y-3">
              {pedidosPendentes.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        {item.tipoProduto === "MATERIAL_TI"
                          ? "Material de TI"
                          : "Toner"}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Qtd: {item.quantidade} • {formatDateBR(item.createdAt)}
                      </p>
                      <p className="mt-1 text-xs font-medium text-blue-800 dark:text-blue-200">
                        Status: {item.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {pedidosPendentes.length > 5 && (
                <Link href="/solicitacoes/pedido-interno">
                  <Button variant="outline" size="sm" className="w-full">
                    Ver todos ({pedidosPendentes.length})
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertsSection;

