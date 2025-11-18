"use client";

import { useEffect, useState, useRef } from "react";
import { RefreshCw, Download } from "lucide-react";

import { getDashboardStats } from "@/actions/get-dashboard-stats";
import { checkAndCreateNotifications } from "@/actions/check-and-create-notifications";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
  PageActions,
} from "@/components/ui/page-container";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import AlertsSection from "./components/alerts-section";
import ChartsSection from "./components/charts-section";
import StatsCards from "./components/stats-cards";
import SummarySection from "./components/summary-section";

const DashboardPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // segundos
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadStats = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
    // Verificar e criar notificações ao carregar
    checkAndCreateNotifications().catch(console.error);

    // Auto-refresh
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        loadStats(true);
        // Verificar notificações a cada refresh
        checkAndCreateNotifications().catch(console.error);
      }, refreshInterval * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, refreshInterval]);

  const handleExport = (format: "json" | "csv" = "json") => {
    if (!stats) return;

    const date = new Date().toISOString().split("T")[0];

    if (format === "json") {
      const data = {
        geradoEm: new Date().toISOString(),
        totais: stats.totais,
        materiaisPorCategoria: stats.materiaisPorCategoria,
        solicitacoesPorStatus: stats.solicitacoesPorStatus,
        pedidosPorStatus: stats.pedidosPorStatus,
        estoquesBaixos: stats.estoquesBaixos,
        solicitacoesPendentes: stats.solicitacoesPendentes,
        pedidosPendentes: stats.pedidosPendentes,
        itensPorLocalidade: stats.itensPorLocalidade,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dashboard-report-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // CSV export
      let csv = "Categoria,Total,Estoque Baixo\n";
      stats.materiaisPorCategoria.forEach((item: any) => {
        csv += `${item.categoria},${item.total},${item.estoqueBaixo}\n`;
      });

      csv += "\n\nSolicitações por Status\n";
      csv += "Status,Total\n";
      stats.solicitacoesPorStatus.forEach((item: any) => {
        csv += `${item.status},${item.total}\n`;
      });

      csv += "\n\nPedidos por Status\n";
      csv += "Status,Total\n";
      stats.pedidosPorStatus.forEach((item: any) => {
        csv += `${item.status},${item.total}\n`;
      });

      csv += "\n\nEstoques Baixos\n";
      csv += "Nome,Categoria,Estoque Atual,Estoque Mínimo,Localidade\n";
      stats.estoquesBaixos.forEach((item: any) => {
        csv += `${item.nome},${item.categoria},${item.estoqueAtual},${item.estoqueMin},${item.localidade}\n`;
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dashboard-report-${date}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Dashboard</PageTitle>
            <PageDescription>
              Visão geral do sistema de inventário
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <PageContent>
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Carregando estatísticas...</p>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  if (!stats) {
    return (
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Dashboard</PageTitle>
            <PageDescription>
              Visão geral do sistema de inventário
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <PageContent>
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">
              Erro ao carregar estatísticas
            </p>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Dashboard</PageTitle>
          <PageDescription>
            Visão geral do sistema de inventário
            {refreshing && (
              <span className="ml-2 text-xs text-muted-foreground">
                (Atualizando...)
              </span>
            )}
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <div className="flex items-center gap-2">
            <Select
              value={refreshInterval.toString()}
              onValueChange={(value) => setRefreshInterval(Number(value))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 segundos</SelectItem>
                <SelectItem value="30">30 segundos</SelectItem>
                <SelectItem value="60">1 minuto</SelectItem>
                <SelectItem value="300">5 minutos</SelectItem>
                <SelectItem value="600">10 minutos</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`}
              />
              Auto-refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadStats(true)}
              disabled={refreshing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport("json")}>
                  Exportar como JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  Exportar como CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </PageActions>
      </PageHeader>
      <PageContent>
        <div className="space-y-6">
          {/* Resumo Geral */}
          <SummarySection
            totais={stats.totais}
            estoquesBaixos={stats.estoquesBaixos.length}
            solicitacoesPendentes={stats.solicitacoesPendentes.length}
            pedidosPendentes={stats.pedidosPendentes.length}
          />

          {/* Cards de Estatísticas */}
          <StatsCards
            totais={stats.totais}
            solicitacoesPendentes={stats.solicitacoesPendentes.length}
            pedidosPendentes={stats.pedidosPendentes.length}
            estoquesBaixos={stats.estoquesBaixos.length}
          />

          {/* Alertas */}
          <AlertsSection
            estoquesBaixos={stats.estoquesBaixos}
            solicitacoesPendentes={stats.solicitacoesPendentes}
            pedidosPendentes={stats.pedidosPendentes}
          />

          {/* Gráficos */}
          <ChartsSection
            materiaisPorCategoria={stats.materiaisPorCategoria}
            solicitacoesPorStatus={stats.solicitacoesPorStatus}
            pedidosPorStatus={stats.pedidosPorStatus}
            itensPorLocalidade={stats.itensPorLocalidade}
          />
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default DashboardPage;
