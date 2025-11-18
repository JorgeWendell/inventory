"use client";

import { useEffect, useState } from "react";

import { getPedidosInternosTable } from "@/actions/get-pedidos-internos-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import PedidosInternosTableRow from "./pedidos-internos-table-row";

export interface PedidoInternoTableData {
  id: string;
  produto: string;
  categoria: string;
  quantidade: number;
  localidadeNome: string;
  impressoraNome: string;
  cor: string;
  status: "AGUARDANDO" | "ENVIADO" | "RECEBIDO";
  produtoExiste: boolean;
  enviadoPor: string | null;
  dataEnvio: string | null;
  recebidoPor: string | null;
  dataRecebimento: string | null;
  solicitante: string;
}

interface PedidosInternosTableProps {
  refreshKey?: number;
}

const PedidosInternosTable = ({
  refreshKey = 0,
}: PedidosInternosTableProps) => {
  const [pedidos, setPedidos] = useState<PedidoInternoTableData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPedidos = () => {
    setLoading(true);
    getPedidosInternosTable()
      .then((data) => setPedidos(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPedidos();
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Carregando pedidos...
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
            <TableHead>Quantidade</TableHead>
            <TableHead>Localidade</TableHead>
            <TableHead>Impressora</TableHead>
            <TableHead>Cor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Recebido por</TableHead>
            <TableHead>Data de recebimento</TableHead>
            <TableHead>Solicitante</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pedidos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center text-muted-foreground">
                Nenhum pedido encontrado
              </TableCell>
            </TableRow>
          ) : (
            pedidos.map((pedido) => (
              <PedidosInternosTableRow
                key={pedido.id}
                pedido={pedido}
                onRefresh={loadPedidos}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PedidosInternosTable;

