"use client";

import { useEffect, useState } from "react";

import { getLogsTable } from "@/actions/get-logs-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import LogsTableRow from "./logs-table-row";

export interface LogTableData {
  id: string;
  tipo: string;
  entidadeId: string;
  acao: string;
  descricao: string;
  dadosAnteriores: unknown;
  dadosNovos: unknown;
  usuario: string;
  createdAt: string;
}

interface LogsTableProps {
  searchTerm?: string;
}

const LogsTable = ({ searchTerm = "" }: LogsTableProps) => {
  const [logs, setLogs] = useState<LogTableData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = () => {
    setLoading(true);
    getLogsTable(searchTerm)
      .then((data) => setLogs(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLogs();
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Carregando logs...
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Ação</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Usuário</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Nenhum log encontrado
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => <LogsTableRow key={log.id} log={log} />)
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LogsTable;

