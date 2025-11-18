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
import { getOfficeTable } from "@/actions/get-office-table";
import { deleteOffice } from "@/actions/delete-office";

import OfficeTableRow from "./office-table-row";
import OfficeTableActions from "./office-table-actions";

interface OfficeTableData {
  id: string;
  nome: string;
  senha: string;
  computadorNome: string;
  usuarioNome: string;
  editadoPor: string;
}

interface OfficeTableProps {
  refreshKey?: number;
  searchTerm?: string;
}

const OfficeTable = ({ refreshKey, searchTerm = "" }: OfficeTableProps) => {
  const [offices, setOffices] = useState<OfficeTableData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOffices = () => {
    setLoading(true);
    getOfficeTable()
      .then(setOffices)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOffices();
  }, [refreshKey]);

  const filteredOffices = useMemo(() => {
    if (!searchTerm) return offices;

    const searchLower = searchTerm.toLowerCase();
    return offices.filter(
      (office) =>
        office.nome.toLowerCase().includes(searchLower) ||
        office.computadorNome.toLowerCase().includes(searchLower) ||
        office.usuarioNome.toLowerCase().includes(searchLower)
    );
  }, [offices, searchTerm]);

  const deleteOfficeAction = useAction(deleteOffice, {
    onSuccess: () => {
      toast.success("Licença Office excluída com sucesso");
      loadOffices();
    },
    onError: () => {
      toast.error("Erro ao excluir licença Office");
    },
  });

  const handleDeleteOfficeClick = (officeId: string) => {
    deleteOfficeAction.execute({ id: officeId });
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando licenças Office...
      </div>
    );
  }

  const hasSearchResults = searchTerm && filteredOffices.length > 0;
  const firstResult = hasSearchResults ? filteredOffices[0] : null;
  const otherResults = hasSearchResults ? filteredOffices.slice(1) : filteredOffices;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Senha</TableHead>
            <TableHead>Computador</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Editado por</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOffices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Nenhuma licença Office encontrada.
              </TableCell>
            </TableRow>
          ) : (
            <>
              {firstResult && (
                <TableRow style={{ backgroundColor: "#b7bbe8" }}>
                  <TableCell className="font-medium">{firstResult.nome}</TableCell>
                  <TableCell>{firstResult.senha}</TableCell>
                  <TableCell>{firstResult.computadorNome}</TableCell>
                  <TableCell>{firstResult.usuarioNome}</TableCell>
                  <TableCell>{firstResult.editadoPor}</TableCell>
                  <TableCell className="text-right">
                    <OfficeTableActions
                      office={firstResult}
                      onDelete={handleDeleteOfficeClick}
                      onEditSuccess={loadOffices}
                    />
                  </TableCell>
                </TableRow>
              )}
              {otherResults.map((office) => (
                <OfficeTableRow
                  key={office.id}
                  office={office}
                  onDelete={handleDeleteOfficeClick}
                  onEditSuccess={loadOffices}
                />
              ))}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default OfficeTable;

