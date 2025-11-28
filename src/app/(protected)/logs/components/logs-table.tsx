"use client";

import { useEffect, useState, useMemo } from "react";

import { getLogsTable } from "@/actions/get-logs-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/common/table-pagination";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadLogs = () => {
    setLoading(true);
    getLogsTable(searchTerm)
      .then((data) => setLogs(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLogs();
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredLogs = useMemo(() => logs, [logs]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

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
          {filteredLogs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Nenhum log encontrado
              </TableCell>
            </TableRow>
          ) : (
            paginatedLogs.map((log) => <LogsTableRow key={log.id} log={log} />)
          )}
        </TableBody>
      </Table>
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default LogsTable;

