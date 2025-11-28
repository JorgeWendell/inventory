"use client";

import { useState, useEffect } from "react";
import { FileText, Calendar } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { ProtectedRoute } from "@/components/permissions/protected-route";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getRelatorioMovimentacoes } from "@/actions/get-relatorio-movimentacoes";
import { getRelatorioSolicitacoes } from "@/actions/get-relatorio-solicitacoes";
import { getRelatorioPedidos } from "@/actions/get-relatorio-pedidos";
import { getRelatorioInventario } from "@/actions/get-relatorio-inventario";
import { getRelatorioUsuarios } from "@/actions/get-relatorio-usuarios";
import { getRelatorioComputadores } from "@/actions/get-relatorio-computadores";
import { getRelatorioMonitores } from "@/actions/get-relatorio-monitores";
import { getRelatorioImpressoras } from "@/actions/get-relatorio-impressoras";
import { getRelatorioToners } from "@/actions/get-relatorio-toners";
import { getRelatorioNobreaks } from "@/actions/get-relatorio-nobreaks";
import { getRelatorioCameras } from "@/actions/get-relatorio-cameras";
import { getRelatorioOffice } from "@/actions/get-relatorio-office";
import { getRelatorioAcessosDepartamentos } from "@/actions/get-relatorio-acessos-departamentos";
import { getRelatorioServidores } from "@/actions/get-relatorio-servidores";

type TipoRelatorio =
  | "movimentacoes"
  | "solicitacoes"
  | "pedidos"
  | "inventario"
  | "usuarios"
  | "computadores"
  | "monitores"
  | "impressoras"
  | "toners"
  | "nobreaks"
  | "cameras"
  | "office"
  | "acessos-departamentos"
  | "servidores";

const RelatoriosPage = () => {
  const [tipoRelatorio, setTipoRelatorio] = useState<TipoRelatorio>("movimentacoes");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [status, setStatus] = useState("");
  const [dados, setDados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const carregarRelatorio = async () => {
    setLoading(true);
    try {
      let resultado: any[] = [];

      switch (tipoRelatorio) {
        case "movimentacoes":
          resultado = await getRelatorioMovimentacoes(dataInicio || undefined, dataFim || undefined);
          break;
        case "solicitacoes":
          resultado = await getRelatorioSolicitacoes(
            dataInicio || undefined,
            dataFim || undefined,
            status || undefined,
          );
          break;
        case "pedidos":
          resultado = await getRelatorioPedidos(
            dataInicio || undefined,
            dataFim || undefined,
            status || undefined,
          );
          break;
        case "inventario":
          const inventario = await getRelatorioInventario();
          resultado = [
            ...inventario.computadores,
            ...inventario.monitores,
            ...inventario.toners,
            ...inventario.nobreaks,
            ...inventario.cameras,
            ...inventario.servidores,
            ...inventario.offices,
          ];
          break;
        case "usuarios":
          resultado = await getRelatorioUsuarios();
          break;
        case "computadores":
          resultado = await getRelatorioComputadores();
          break;
        case "monitores":
          resultado = await getRelatorioMonitores();
          break;
        case "impressoras":
          resultado = await getRelatorioImpressoras();
          break;
        case "toners":
          resultado = await getRelatorioToners();
          break;
        case "nobreaks":
          resultado = await getRelatorioNobreaks();
          break;
        case "cameras":
          resultado = await getRelatorioCameras();
          break;
        case "office":
          resultado = await getRelatorioOffice();
          break;
        case "acessos-departamentos":
          resultado = await getRelatorioAcessosDepartamentos();
          break;
        case "servidores":
          resultado = await getRelatorioServidores();
          break;
      }

      setDados(resultado);
      toast.success(`${resultado.length} registros encontrados`);
    } catch (error) {
      console.error("Erro ao carregar relatório:", error);
      toast.error("Erro ao carregar relatório");
    } finally {
      setLoading(false);
    }
  };

  const exportarCSV = () => {
    if (dados.length === 0) {
      toast.error("Não há dados para exportar");
      return;
    }

    const headers = Object.keys(dados[0]);
    let csv = headers.join(",") + "\n";

    dados.forEach((item) => {
      const row = headers.map((header) => {
        const value = item[header];
        if (value === null || value === undefined) return "";
        if (typeof value === "object") return JSON.stringify(value);
        return String(value).replace(/,/g, ";");
      });
      csv += row.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${tipoRelatorio}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Relatório exportado com sucesso!");
  };

  const exportarPDF = () => {
    if (dados.length === 0) {
      toast.error("Não há dados para exportar");
      return;
    }

    const doc = new jsPDF("landscape", "mm", "a4");
    
    const tipoRelatorioNome = {
      movimentacoes: "Movimentações de Estoque",
      solicitacoes: "Solicitações de Compra",
      pedidos: "Pedidos Internos",
      inventario: "Inventário Completo",
      usuarios: "Usuários",
      computadores: "Computadores",
      monitores: "Monitores",
      impressoras: "Impressoras",
      toners: "Toners",
      nobreaks: "Nobreaks",
      cameras: "Câmeras",
      office: "Office",
      "acessos-departamentos": "Acessos Departamentos",
      servidores: "Servidores",
    }[tipoRelatorio] || "Relatório";

    doc.setFontSize(16);
    doc.text(tipoRelatorioNome, 14, 15);
    
    doc.setFontSize(10);
    const dataGeracao = new Date().toLocaleString("pt-BR");
    doc.text(`Gerado em: ${dataGeracao}`, 14, 22);
    
    if (dataInicio || dataFim) {
      const periodo = `Período: ${dataInicio || "Início"} até ${dataFim || "Fim"}`;
      doc.text(periodo, 14, 27);
    }

    const allHeaders = Object.keys(dados[0]);
    const headers = allHeaders.filter((header) => 
      header.toLowerCase() !== "atualizadopor" && 
      header.toLowerCase() !== "atualizado por"
    );
    const rows = dados.map((item) =>
      headers.map((header) => {
        const value = item[header];
        if (value === null || value === undefined) return "N/A";
        if (typeof value === "object") return JSON.stringify(value);
        if (header.includes("Date") || header.includes("At")) {
          return formatDate(value);
        }
        return String(value);
      })
    );

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: dataInicio || dataFim ? 32 : 27,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: dataInicio || dataFim ? 32 : 27 },
    });

    const fileName = `relatorio-${tipoRelatorio}-${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
    toast.success("Relatório PDF exportado com sucesso!");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const offset = -3 * 60;
    const localDate = new Date(
      date.getTime() + (offset - date.getTimezoneOffset()) * 60000,
    );
    return localDate.toLocaleDateString("pt-BR");
  };

  useEffect(() => {
    // Carregar relatório ao mudar o tipo (apenas para relatórios que não precisam de filtros)
    const relatoriosSemFiltros = [
      "inventario",
      "usuarios",
      "computadores",
      "monitores",
      "impressoras",
      "toners",
      "nobreaks",
      "cameras",
      "office",
      "acessos-departamentos",
      "servidores",
    ];
    if (relatoriosSemFiltros.includes(tipoRelatorio)) {
      carregarRelatorio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoRelatorio]);

  return (
    <ProtectedRoute route="/relatorios">
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              <PageTitle>Relatórios</PageTitle>
            </div>
            <PageDescription>
              Gere e exporte relatórios do sistema
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <PageContent>
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Tipo de Relatório
                  </label>
                  <Select
                    value={tipoRelatorio}
                    onValueChange={(value) => setTipoRelatorio(value as TipoRelatorio)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="movimentacoes">
                        Movimentações de Estoque
                      </SelectItem>
                      <SelectItem value="solicitacoes">
                        Solicitações de Compra
                      </SelectItem>
                      <SelectItem value="pedidos">Pedidos Internos</SelectItem>
                      <SelectItem value="inventario">Inventário Completo</SelectItem>
                      <SelectItem value="usuarios">Usuários</SelectItem>
                      <SelectItem value="computadores">Computadores</SelectItem>
                      <SelectItem value="monitores">Monitores</SelectItem>
                      <SelectItem value="impressoras">Impressoras</SelectItem>
                      <SelectItem value="toners">Toners</SelectItem>
                      <SelectItem value="nobreaks">Nobreaks</SelectItem>
                      <SelectItem value="cameras">Câmeras</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="acessos-departamentos">
                        Acessos Departamentos
                      </SelectItem>
                      <SelectItem value="servidores">Servidores</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {!["inventario", "usuarios", "computadores", "monitores", "impressoras", "toners", "nobreaks", "cameras", "office", "acessos-departamentos", "servidores"].includes(tipoRelatorio) && (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Data Início
                      </label>
                      <Input
                        type="date"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Data Fim
                      </label>
                      <Input
                        type="date"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {(tipoRelatorio === "solicitacoes" ||
                  tipoRelatorio === "pedidos") && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Status
                    </label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos</SelectItem>
                        {tipoRelatorio === "solicitacoes" ? (
                          <>
                            <SelectItem value="EM_ANDAMENTO">
                              Em Andamento
                            </SelectItem>
                            <SelectItem value="AGUARDANDO_ENTREGA">
                              Aguardando Entrega
                            </SelectItem>
                            <SelectItem value="COMPRADO">Comprado</SelectItem>
                            <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="AGUARDANDO">Aguardando</SelectItem>
                            <SelectItem value="ENVIADO">Enviado</SelectItem>
                            <SelectItem value="RECEBIDO">Recebido</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={carregarRelatorio} disabled={loading}>
                  <Calendar className="mr-2 h-4 w-4" />
                  {loading ? "Carregando..." : "Gerar Relatório"}
                </Button>
                {dados.length > 0 && (
                  <Button onClick={exportarPDF} variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Exportar PDF
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {dados.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Resultados ({dados.length} registros)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(dados[0]).map((key) => (
                          <TableHead key={key}>{key}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dados.slice(0, 100).map((item, index) => (
                        <TableRow key={index}>
                          {Object.keys(dados[0]).map((key) => (
                            <TableCell key={key}>
                              {key.includes("Date") || key.includes("At")
                                ? formatDate(item[key])
                                : typeof item[key] === "object"
                                  ? JSON.stringify(item[key])
                                  : String(item[key] || "N/A")}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {dados.length > 100 && (
                  <p className="text-sm text-muted-foreground mt-4">
                    Mostrando 100 de {dados.length} registros. Exporte o CSV
                    para ver todos.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </PageContent>
      </PageContainer>
    </ProtectedRoute>
  );
};

export default RelatoriosPage;

