"use client";

import { useEffect, useState } from "react";

import { getSolicitacoesCompraTable } from "@/actions/get-solicitacoes-compra-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import SolicitacoesTableRow from "./solicitacoes-table-row";

export interface SolicitacaoCompraTableData {
  id: string;
  quantidade: number;
  status: "EM_ANDAMENTO" | "AGUARDANDO_ENTREGA" | "COMPRADO" | "CONCLUIDO";
  cotacoesNotas: string;
  cotacaoSelecionada: {
    id: string;
    fornecedorNome: string;
  } | null;
  material: {
    id: string;
    nome: string;
    categoria: string;
    estoqueMin: number;
    estoqueAtual: number;
    localidade: string;
  };
  recebidoPor: string | null;
  dataRecebimento: string | null;
  numeroNotaFiscal: string | null;
  editadoPor: string;
}

interface SolicitacoesTableProps {
  refreshKey?: number;
}

const SolicitacoesTable = ({ refreshKey = 0 }: SolicitacoesTableProps) => {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoCompraTableData[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  const loadSolicitacoes = () => {
    setLoading(true);
    getSolicitacoesCompraTable()
      .then((data) => setSolicitacoes(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSolicitacoes();
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Carregando solicitações...
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Estoque min.</TableHead>
            <TableHead>Estoque atual</TableHead>
            <TableHead>Localidade</TableHead>
            <TableHead>Fornecedor</TableHead>
            <TableHead>Recebido por</TableHead>
            <TableHead>Data recebimento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Editado por</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {solicitacoes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Nenhuma solicitação encontrada.
              </TableCell>
            </TableRow>
          ) : (
            solicitacoes.map((solicitacao) => (
              <SolicitacoesTableRow
                key={solicitacao.id}
                solicitacao={solicitacao}
                onRefresh={loadSolicitacoes}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SolicitacoesTable;


