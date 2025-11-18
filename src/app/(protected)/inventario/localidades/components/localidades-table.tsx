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
import { getLocalidadesTable } from "@/actions/get-localidades-table";
import { deleteLocalidade } from "@/actions/delete-localidade";

import LocalidadesTableRow from "./localidades-table-row";
import LocalidadesTableActions from "./localidades-table-actions";

interface LocalidadeTableData {
  id: string;
  nome: string;
  endereco: string;
  editadoPor: string;
}

interface LocalidadesTableProps {
  refreshKey?: number;
  searchTerm?: string;
}

const LocalidadesTable = ({ refreshKey, searchTerm = "" }: LocalidadesTableProps) => {
  const [localidades, setLocalidades] = useState<LocalidadeTableData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLocalidades = () => {
    setLoading(true);
    getLocalidadesTable()
      .then(setLocalidades)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLocalidades();
  }, [refreshKey]);

  const filteredLocalidades = useMemo(() => {
    if (!searchTerm) return localidades;

    const searchLower = searchTerm.toLowerCase();
    return localidades.filter((localidade) =>
      localidade.nome.toLowerCase().includes(searchLower)
    );
  }, [localidades, searchTerm]);

  const deleteLocalidadeAction = useAction(deleteLocalidade, {
    onSuccess: () => {
      toast.success("Localidade excluída com sucesso");
      loadLocalidades();
    },
    onError: () => {
      toast.error("Erro ao excluir localidade");
    },
  });

  const handleDeleteLocalidadeClick = (localidadeId: string) => {
    deleteLocalidadeAction.execute({ id: localidadeId });
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando localidades...
      </div>
    );
  }

  const hasSearchResults = searchTerm && filteredLocalidades.length > 0;
  const firstResult = hasSearchResults ? filteredLocalidades[0] : null;
  const otherResults = hasSearchResults ? filteredLocalidades.slice(1) : filteredLocalidades;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Endereço</TableHead>
            <TableHead>Editado por</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLocalidades.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                Nenhuma localidade encontrada.
              </TableCell>
            </TableRow>
          ) : (
            <>
              {firstResult && (
                <TableRow style={{ backgroundColor: "#b7bbe8" }}>
                  <TableCell className="font-medium">{firstResult.nome}</TableCell>
                  <TableCell>{firstResult.endereco}</TableCell>
                  <TableCell>{firstResult.editadoPor}</TableCell>
                  <TableCell className="text-right">
                    <LocalidadesTableActions
                      localidade={firstResult}
                      onDelete={handleDeleteLocalidadeClick}
                      onEditSuccess={loadLocalidades}
                    />
                  </TableCell>
                </TableRow>
              )}
              {otherResults.map((localidade) => (
                <LocalidadesTableRow
                  key={localidade.id}
                  localidade={localidade}
                  onDelete={handleDeleteLocalidadeClick}
                  onEditSuccess={loadLocalidades}
                />
              ))}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LocalidadesTable;

