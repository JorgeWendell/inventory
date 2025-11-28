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
import { getNobreaksTable } from "@/actions/get-nobreaks-table";
import { deleteNobreak } from "@/actions/delete-nobreak";

import NobreaksTableRow from "./nobreaks-table-row";
import NobreaksTableActions from "./nobreaks-table-actions";

interface NobreakTableData {
  id: string;
  marca: string;
  modelo: string;
  capacidade: string;
  localidadeNome: string;
  usuarioNome: string;
  computadoresNome: string;
  editadoPor: string;
}

interface NobreaksTableProps {
  refreshKey?: number;
  searchTerm?: string;
}

const NobreaksTable = ({ refreshKey, searchTerm = "" }: NobreaksTableProps) => {
  const [nobreaks, setNobreaks] = useState<NobreakTableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadNobreaks = () => {
    setLoading(true);
    getNobreaksTable()
      .then(setNobreaks)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNobreaks();
    setCurrentPage(1);
  }, [refreshKey, searchTerm]);

  const filteredNobreaks = useMemo(() => {
    if (!searchTerm) return nobreaks;

    const searchLower = searchTerm.toLowerCase();
    return nobreaks.filter(
      (nobreak) =>
        nobreak.marca.toLowerCase().includes(searchLower) ||
        nobreak.modelo.toLowerCase().includes(searchLower) ||
        nobreak.capacidade.toLowerCase().includes(searchLower) ||
        nobreak.localidadeNome.toLowerCase().includes(searchLower) ||
        nobreak.usuarioNome.toLowerCase().includes(searchLower)
    );
  }, [nobreaks, searchTerm]);

  const deleteNobreakAction = useAction(deleteNobreak, {
    onSuccess: () => {
      toast.success("Nobreak excluído com sucesso");
      loadNobreaks();
    },
    onError: () => {
      toast.error("Erro ao excluir nobreak");
    },
  });

  const handleDeleteNobreakClick = (nobreakId: string) => {
    deleteNobreakAction.execute({ id: nobreakId });
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando nobreaks...
      </div>
    );
  }

  const totalPages = Math.ceil(filteredNobreaks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNobreaks = filteredNobreaks.slice(startIndex, endIndex);

  const hasSearchResults = searchTerm && filteredNobreaks.length > 0 && currentPage === 1;
  const firstResult = hasSearchResults && paginatedNobreaks.length > 0 ? paginatedNobreaks[0] : null;
  const otherResults = hasSearchResults && paginatedNobreaks.length > 0 
    ? paginatedNobreaks.slice(1) 
    : paginatedNobreaks;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Marca</TableHead>
            <TableHead>Modelo</TableHead>
            <TableHead>Capacidade</TableHead>
            <TableHead>Localidade</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Computador</TableHead>
            <TableHead>Editado por</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredNobreaks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Nenhum nobreak encontrado.
              </TableCell>
            </TableRow>
          ) : (
            <>
              {firstResult && (
                <TableRow style={{ backgroundColor: "#b7bbe8" }}>
                  <TableCell className="font-medium">{firstResult.marca}</TableCell>
                  <TableCell>{firstResult.modelo}</TableCell>
                  <TableCell>{firstResult.capacidade}</TableCell>
                  <TableCell>{firstResult.localidadeNome}</TableCell>
                  <TableCell>{firstResult.usuarioNome}</TableCell>
                  <TableCell>{firstResult.computadoresNome}</TableCell>
                  <TableCell>{firstResult.editadoPor}</TableCell>
                  <TableCell className="text-right">
                    <NobreaksTableActions
                      nobreak={firstResult}
                      onDelete={handleDeleteNobreakClick}
                      onEditSuccess={loadNobreaks}
                    />
                  </TableCell>
                </TableRow>
              )}
              {otherResults.map((nobreak) => (
                <NobreaksTableRow
                  key={nobreak.id}
                  nobreak={nobreak}
                  onDelete={handleDeleteNobreakClick}
                  onEditSuccess={loadNobreaks}
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

export default NobreaksTable;

