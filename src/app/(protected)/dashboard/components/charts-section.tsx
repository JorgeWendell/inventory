"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MateriaisPorCategoria {
  categoria: string;
  total: number;
  estoqueBaixo: number;
}

interface SolicitacoesPorStatus {
  status: string;
  total: number;
}

interface PedidosPorStatus {
  status: string;
  total: number;
}

interface ItensPorLocalidade {
  localidade: string;
  total: number;
}

interface ChartsSectionProps {
  materiaisPorCategoria: MateriaisPorCategoria[];
  solicitacoesPorStatus: SolicitacoesPorStatus[];
  pedidosPorStatus: PedidosPorStatus[];
  itensPorLocalidade: ItensPorLocalidade[];
}

const ChartsSection = ({
  materiaisPorCategoria,
  solicitacoesPorStatus,
  pedidosPorStatus,
  itensPorLocalidade,
}: ChartsSectionProps) => {
  const formatStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      EM_ANDAMENTO: "Em Andamento",
      AGUARDANDO_ENTREGA: "Aguardando Entrega",
      COMPRADO: "Comprado",
      CONCLUIDO: "Concluído",
      AGUARDANDO: "Aguardando",
      ENVIADO: "Enviado",
      RECEBIDO: "Recebido",
    };
    return statusMap[status] || status;
  };

  const maxValue = (data: { total: number }[]): number => {
    if (data.length === 0) return 1;
    return Math.max(...data.map((item) => item.total), 1);
  };

  const maxMateriais = maxValue(materiaisPorCategoria);
  const maxSolicitacoes = maxValue(solicitacoesPorStatus);
  const maxPedidos = maxValue(pedidosPorStatus);
  const maxLocalidade = maxValue(itensPorLocalidade);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Materiais por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Materiais por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {materiaisPorCategoria.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum material cadastrado
              </p>
            ) : (
              materiaisPorCategoria.map((item) => (
                <div key={item.categoria} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.categoria}</span>
                    <span className="text-muted-foreground">
                      {item.total} itens
                      {item.estoqueBaixo > 0 && (
                        <span className="ml-2 text-red-600">
                          ({item.estoqueBaixo} baixo)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-blue-600 transition-all"
                      style={{
                        width: `${(item.total / maxMateriais) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Solicitações por Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Solicitações por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {solicitacoesPorStatus.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma solicitação
              </p>
            ) : (
              solicitacoesPorStatus.map((item) => (
                <div key={item.status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {formatStatus(item.status)}
                    </span>
                    <span className="text-muted-foreground">
                      {item.total} solicitações
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-yellow-600 transition-all"
                      style={{
                        width: `${(item.total / maxSolicitacoes) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pedidos por Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pedidos Internos por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pedidosPorStatus.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum pedido interno
              </p>
            ) : (
              pedidosPorStatus.map((item) => (
                <div key={item.status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {formatStatus(item.status)}
                    </span>
                    <span className="text-muted-foreground">
                      {item.total} pedidos
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-indigo-600 transition-all"
                      style={{
                        width: `${(item.total / maxPedidos) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Itens por Localidade */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Materiais por Localidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {itensPorLocalidade.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum item por localidade
              </p>
            ) : (
              itensPorLocalidade.map((item) => (
                <div key={item.localidade} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.localidade}</span>
                    <span className="text-muted-foreground">
                      {item.total} itens
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-green-600 transition-all"
                      style={{
                        width: `${(item.total / maxLocalidade) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartsSection;

