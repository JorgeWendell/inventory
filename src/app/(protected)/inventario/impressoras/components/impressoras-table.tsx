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
import { getImpressorasTable } from "@/actions/get-impressoras-table";
import { deleteImpressora } from "@/actions/delete-impressora";

import ImpressorasTableRow from "./impressoras-table-row";
import ImpressorasTableActions from "./impressoras-table-actions";

interface ImpressoraTableData {
  id: string;
  nome: string;
  marca: string;
  modelo: string;
  localidadeNome: string;
  manutencao: string;
  editadoPor: string;
}

interface ImpressorasTableProps {
  refreshKey?: number;
  searchTerm?: string;
}

const ImpressorasTable = ({ refreshKey, searchTerm = "" }: ImpressorasTableProps) => {
  const [impressoras, setImpressoras] = useState<ImpressoraTableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadImpressoras = () => {
    setLoading(true);
    getImpressorasTable()
      .then(setImpressoras)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadImpressoras();
    setCurrentPage(1);
  }, [refreshKey, searchTerm]);

  const filteredImpressoras = useMemo(() => {
    if (!searchTerm) return impressoras;

    const searchLower = searchTerm.toLowerCase();
    return impressoras.filter(
      (impressora) =>
        impressora.nome.toLowerCase().includes(searchLower) ||
        impressora.marca.toLowerCase().includes(searchLower) ||
        impressora.modelo.toLowerCase().includes(searchLower) ||
        impressora.localidadeNome.toLowerCase().includes(searchLower)
    );
  }, [impressoras, searchTerm]);

  const deleteImpressoraAction = useAction(deleteImpressora, {
    onSuccess: () => {
      toast.success("Impressora excluída com sucesso");
      loadImpressoras();
    },
    onError: () => {
      toast.error("Erro ao excluir impressora");
    },
  });

  const handleDeleteImpressoraClick = (impressoraId: string) => {
    deleteImpressoraAction.execute({ id: impressoraId });
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando impressoras...
      </div>
    );
  }

  const totalPages = Math.ceil(filteredImpressoras.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedImpressoras = filteredImpressoras.slice(startIndex, endIndex);

  const hasSearchResults = searchTerm && filteredImpressoras.length > 0 && currentPage === 1;
  const firstResult = hasSearchResults && paginatedImpressoras.length > 0 ? paginatedImpressoras[0] : null;
  const otherResults = hasSearchResults && paginatedImpressoras.length > 0 
    ? paginatedImpressoras.slice(1) 
    : paginatedImpressoras;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead>Modelo</TableHead>
            <TableHead>Localidade</TableHead>
            <TableHead>Manutenção</TableHead>
            <TableHead>Editado por</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredImpressoras.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Nenhuma impressora encontrada.
              </TableCell>
            </TableRow>
          ) : (
            <>
              {firstResult && (
                <TableRow style={{ backgroundColor: "#b7bbe8" }}>
                  <TableCell className="font-medium">{firstResult.nome}</TableCell>
                  <TableCell>{firstResult.marca}</TableCell>
                  <TableCell>{firstResult.modelo}</TableCell>
                  <TableCell>{firstResult.localidadeNome}</TableCell>
                  <TableCell>{firstResult.manutencao}</TableCell>
                  <TableCell>{firstResult.editadoPor}</TableCell>
                  <TableCell className="text-right">
                    <ImpressorasTableActions
                      impressora={firstResult}
                      onDelete={handleDeleteImpressoraClick}
                      onEditSuccess={loadImpressoras}
                    />
                  </TableCell>
                </TableRow>
              )}
              {otherResults.map((impressora) => (
                <ImpressorasTableRow
                  key={impressora.id}
                  impressora={impressora}
                  onDelete={handleDeleteImpressoraClick}
                  onEditSuccess={loadImpressoras}
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

export default ImpressorasTable;

