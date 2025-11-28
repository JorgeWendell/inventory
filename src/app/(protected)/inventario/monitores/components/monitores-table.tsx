"use client";

import { useAction } from "next-safe-action/hooks";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/common/table-pagination";
import { getMonitoresTable } from "@/actions/get-monitores-table";
import { deleteMonitor } from "@/actions/delete-monitor";

import MonitoresTableRow from "./monitores-table-row";
import MonitoresTableActions from "./monitores-table-actions";

interface MonitorTableData {
  id: string;
  marca: string;
  modelo: string;
  usuarioNome: string;
  localidadeNome: string;
  editadoPor: string;
}

interface MonitoresTableProps {
  refreshKey?: number;
  searchTerm?: string;
}

const MonitoresTable = ({ refreshKey, searchTerm = "" }: MonitoresTableProps) => {
  const [monitores, setMonitores] = useState<MonitorTableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadMonitores = () => {
    setLoading(true);
    getMonitoresTable()
      .then(setMonitores)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMonitores();
    setCurrentPage(1);
  }, [refreshKey, searchTerm]);

  const filteredMonitores = useMemo(() => {
    if (!searchTerm) return monitores;

    const searchLower = searchTerm.toLowerCase();
    return monitores.filter(
      (monitor) =>
        monitor.marca.toLowerCase().includes(searchLower) ||
        monitor.usuarioNome.toLowerCase().includes(searchLower) ||
        monitor.localidadeNome.toLowerCase().includes(searchLower)
    );
  }, [monitores, searchTerm]);

  const deleteMonitorAction = useAction(deleteMonitor, {
    onSuccess: () => {
      toast.success("Monitor excluído com sucesso");
      loadMonitores();
    },
    onError: () => {
      toast.error("Erro ao excluir monitor");
    },
  });

  const handleDeleteMonitorClick = (monitorId: string) => {
    deleteMonitorAction.execute({ id: monitorId });
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando monitores...
      </div>
    );
  }

  const totalPages = Math.ceil(filteredMonitores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMonitores = filteredMonitores.slice(startIndex, endIndex);

  const hasSearchResults = searchTerm && filteredMonitores.length > 0 && currentPage === 1;
  const firstResult = hasSearchResults && paginatedMonitores.length > 0 ? paginatedMonitores[0] : null;
  const otherResults = hasSearchResults && paginatedMonitores.length > 0 
    ? paginatedMonitores.slice(1) 
    : paginatedMonitores;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Marca</TableHead>
            <TableHead>Modelo</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Localidade</TableHead>
            <TableHead>Editado por</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMonitores.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Nenhum monitor encontrado.
              </TableCell>
            </TableRow>
          ) : (
            <>
              {firstResult && (
                <TableRow style={{ backgroundColor: "#b7bbe8" }}>
                  <TableCell className="font-medium">{firstResult.marca}</TableCell>
                  <TableCell>{firstResult.modelo}</TableCell>
                  <TableCell>{firstResult.usuarioNome}</TableCell>
                  <TableCell>{firstResult.localidadeNome}</TableCell>
                  <TableCell>{firstResult.editadoPor}</TableCell>
                  <TableCell className="text-right">
                    <MonitoresTableActions
                      monitor={firstResult}
                      onDelete={handleDeleteMonitorClick}
                      onEditSuccess={loadMonitores}
                    />
                  </TableCell>
                </TableRow>
              )}
              {otherResults.map((monitor) => (
                <MonitoresTableRow
                  key={monitor.id}
                  monitor={monitor}
                  onDelete={handleDeleteMonitorClick}
                  onEditSuccess={loadMonitores}
                />
              ))}
            </>
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

export default MonitoresTable;

