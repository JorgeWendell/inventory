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
import { getComputadoresTable } from "@/actions/get-computadores-table";
import { deleteComputador } from "@/actions/delete-computador";

import ComputadoresTableRow from "./computadores-table-row";
import ComputadoresTableActions from "./computadores-table-actions";

interface ComputadorTableData {
  id: string;
  nome: string;
  marca: string;
  modelo: string;
  manutencao: boolean;
  localidadeNome: string;
  usuarioNome: string;
  editadoPor: string;
}

interface ComputadoresTableProps {
  refreshKey?: number;
  searchTerm?: string;
}

const ComputadoresTable = ({ refreshKey, searchTerm = "" }: ComputadoresTableProps) => {
  const [computadores, setComputadores] = useState<ComputadorTableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadComputadores = () => {
    setLoading(true);
    getComputadoresTable()
      .then(setComputadores)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadComputadores();
    setCurrentPage(1);
  }, [refreshKey, searchTerm]);

  const filteredComputadores = useMemo(() => {
    if (!searchTerm) return computadores;

    const searchLower = searchTerm.toLowerCase();
    return computadores.filter(
      (computador) =>
        computador.nome.toLowerCase().includes(searchLower) ||
        computador.localidadeNome.toLowerCase().includes(searchLower) ||
        computador.usuarioNome.toLowerCase().includes(searchLower) ||
        computador.marca.toLowerCase().includes(searchLower)
    );
  }, [computadores, searchTerm]);

  const deleteComputadorAction = useAction(deleteComputador, {
    onSuccess: () => {
      toast.success("Computador excluído com sucesso");
      loadComputadores();
    },
    onError: () => {
      toast.error("Erro ao excluir computador");
    },
  });

  const handleDeleteComputadorClick = (computadorId: string) => {
    deleteComputadorAction.execute({ id: computadorId });
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando computadores...
      </div>
    );
  }

  const totalPages = Math.ceil(filteredComputadores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedComputadores = filteredComputadores.slice(startIndex, endIndex);

  const hasSearchResults = searchTerm && filteredComputadores.length > 0 && currentPage === 1;
  const firstResult = hasSearchResults && paginatedComputadores.length > 0 ? paginatedComputadores[0] : null;
  const otherResults = hasSearchResults && paginatedComputadores.length > 0 
    ? paginatedComputadores.slice(1) 
    : paginatedComputadores;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead>Modelo</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Localidade</TableHead>
            <TableHead>Manutenção</TableHead>
            <TableHead>Editado por</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredComputadores.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Nenhum computador encontrado.
              </TableCell>
            </TableRow>
          ) : (
            <>
              {firstResult && (
                <TableRow style={{ backgroundColor: "#b7bbe8" }}>
                  <TableCell className="font-medium">{firstResult.nome}</TableCell>
                  <TableCell>{firstResult.marca}</TableCell>
                  <TableCell>{firstResult.modelo}</TableCell>
                  <TableCell>{firstResult.usuarioNome}</TableCell>
                  <TableCell>{firstResult.localidadeNome}</TableCell>
                  <TableCell>{firstResult.manutencao ? "Sim" : "Não"}</TableCell>
                  <TableCell>{firstResult.editadoPor}</TableCell>
                  <TableCell className="text-right">
                    <ComputadoresTableActions
                      computador={firstResult}
                      onDelete={handleDeleteComputadorClick}
                      onEditSuccess={loadComputadores}
                    />
                  </TableCell>
                </TableRow>
              )}
              {otherResults.map((computador) => (
                <ComputadoresTableRow
                  key={computador.id}
                  computador={computador}
                  onDelete={handleDeleteComputadorClick}
                  onEditSuccess={loadComputadores}
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

export default ComputadoresTable;

