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

  const loadImpressoras = () => {
    setLoading(true);
    getImpressorasTable()
      .then(setImpressoras)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadImpressoras();
  }, [refreshKey]);

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

  const hasSearchResults = searchTerm && filteredImpressoras.length > 0;
  const firstResult = hasSearchResults ? filteredImpressoras[0] : null;
  const otherResults = hasSearchResults ? filteredImpressoras.slice(1) : filteredImpressoras;

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
    </div>
  );
};

export default ImpressorasTable;

