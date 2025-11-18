"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

interface SummarySectionProps {
  totais: {
    computadores: number;
    monitores: number;
    nobreaks: number;
    toners: number;
    materiais: number;
  };
  estoquesBaixos: number;
  solicitacoesPendentes: number;
  pedidosPendentes: number;
}

const SummarySection = ({
  totais,
  estoquesBaixos,
  solicitacoesPendentes,
  pedidosPendentes,
}: SummarySectionProps) => {
  const totalItens =
    totais.computadores +
    totais.monitores +
    totais.nobreaks +
    totais.toners +
    totais.materiais;

  const totalPendentes = solicitacoesPendentes + pedidosPendentes;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalItens}</div>
          <p className="text-xs text-muted-foreground">
            {totais.computadores} computadores, {totais.monitores} monitores,{" "}
            {totais.nobreaks} nobreaks, {totais.toners} toners,{" "}
            {totais.materiais} materiais
          </p>
        </CardContent>
      </Card>

      <Card className={totalPendentes > 0 ? "border-yellow-500" : ""}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pendências Totais
          </CardTitle>
          {totalPendentes > 0 ? (
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-green-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPendentes}</div>
          <p className="text-xs text-muted-foreground">
            {solicitacoesPendentes} solicitações, {pedidosPendentes} pedidos
          </p>
        </CardContent>
      </Card>

      <Card className={estoquesBaixos > 0 ? "border-red-500" : ""}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estoques Baixos</CardTitle>
          {estoquesBaixos > 0 ? (
            <AlertCircle className="h-4 w-4 text-red-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-green-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estoquesBaixos}</div>
          <p className="text-xs text-muted-foreground">
            {estoquesBaixos > 0
              ? "Requer atenção imediata"
              : "Todos os estoques estão adequados"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummarySection;

