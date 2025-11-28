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
import { getAcessosDepartamentosTable } from "@/actions/get-acessos-departamentos-table";
import { deleteAcessoDepartamento } from "@/actions/delete-acesso-departamento";

import AcessosDepartamentosTableRow from "./acessos-departamentos-table-row";
import AcessosDepartamentosTableActions from "./acessos-departamentos-table-actions";

interface AcessoDepartamentoTableData {
  id: string;
  usuarioLogin: string;
  computadorNome: string;
  pastaDepartamentos: string;
  editadoPor: string;
}

interface AcessosDepartamentosTableProps {
  refreshKey?: number;
  searchTerm?: string;
}

const AcessosDepartamentosTable = ({ refreshKey, searchTerm = "" }: AcessosDepartamentosTableProps) => {
  const [acessosDepartamentos, setAcessosDepartamentos] = useState<AcessoDepartamentoTableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadAcessosDepartamentos = () => {
    setLoading(true);
    getAcessosDepartamentosTable()
      .then(setAcessosDepartamentos)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAcessosDepartamentos();
    setCurrentPage(1);
  }, [refreshKey, searchTerm]);

  const filteredAcessosDepartamentos = useMemo(() => {
    if (!searchTerm) return acessosDepartamentos;

    const searchLower = searchTerm.toLowerCase();
    return acessosDepartamentos.filter(
      (acessoDepartamento) =>
        acessoDepartamento.usuarioLogin.toLowerCase().includes(searchLower) ||
        acessoDepartamento.computadorNome.toLowerCase().includes(searchLower) ||
        acessoDepartamento.pastaDepartamentos.toLowerCase().includes(searchLower)
    );
  }, [acessosDepartamentos, searchTerm]);

  const deleteAcessoDepartamentoAction = useAction(deleteAcessoDepartamento, {
    onSuccess: () => {
      toast.success("Acesso a Departamento excluído com sucesso");
      loadAcessosDepartamentos();
    },
    onError: () => {
      toast.error("Erro ao excluir acesso a Departamento");
    },
  });

  const handleDeleteAcessoDepartamentoClick = (acessoDepartamentoId: string) => {
    deleteAcessoDepartamentoAction.execute({ id: acessoDepartamentoId });
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando acessos e departamentos...
      </div>
    );
  }

  const totalPages = Math.ceil(filteredAcessosDepartamentos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAcessosDepartamentos = filteredAcessosDepartamentos.slice(startIndex, endIndex);

  const hasSearchResults = searchTerm && filteredAcessosDepartamentos.length > 0 && currentPage === 1;
  const firstResult = hasSearchResults && paginatedAcessosDepartamentos.length > 0 ? paginatedAcessosDepartamentos[0] : null;
  const otherResults = hasSearchResults && paginatedAcessosDepartamentos.length > 0 
    ? paginatedAcessosDepartamentos.slice(1) 
    : paginatedAcessosDepartamentos;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead>Computador</TableHead>
            <TableHead>Pasta</TableHead>
            <TableHead>Editado por</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAcessosDepartamentos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Nenhum acesso encontrado.
              </TableCell>
            </TableRow>
          ) : (
            <>
              {firstResult && (
                <TableRow style={{ backgroundColor: "#b7bbe8" }}>
                  <TableCell className="font-medium">{firstResult.usuarioLogin}</TableCell>
                  <TableCell>{firstResult.computadorNome}</TableCell>
                  <TableCell>{firstResult.pastaDepartamentos}</TableCell>
                  <TableCell>{firstResult.editadoPor}</TableCell>
                  <TableCell className="text-right">
                    <AcessosDepartamentosTableActions
                      acessoDepartamento={firstResult}
                      onDelete={handleDeleteAcessoDepartamentoClick}
                      onEditSuccess={loadAcessosDepartamentos}
                    />
                  </TableCell>
                </TableRow>
              )}
              {otherResults.map((acessoDepartamento) => (
                <AcessosDepartamentosTableRow
                  key={acessoDepartamento.id}
                  acessoDepartamento={acessoDepartamento}
                  onDelete={handleDeleteAcessoDepartamentoClick}
                  onEditSuccess={loadAcessosDepartamentos}
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

export default AcessosDepartamentosTable;

