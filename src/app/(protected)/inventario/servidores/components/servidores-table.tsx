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
import { getServidoresTable } from "@/actions/get-servidores-table";
import { deleteServidor } from "@/actions/delete-servidor";

import ServidoresTableRow from "./servidores-table-row";
import ServidoresTableActions from "./servidores-table-actions";

interface ServidorTableData {
  id: string;
  nome: string;
  funcao: string;
  vm: string;
  editadoPor: string;
}

interface ServidoresTableProps {
  refreshKey?: number;
  searchTerm?: string;
}

const ServidoresTable = ({ refreshKey, searchTerm = "" }: ServidoresTableProps) => {
  const [servidores, setServidores] = useState<ServidorTableData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadServidores = () => {
    setLoading(true);
    getServidoresTable()
      .then(setServidores)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadServidores();
  }, [refreshKey]);

  const filteredServidores = useMemo(() => {
    if (!searchTerm) return servidores;

    const searchLower = searchTerm.toLowerCase();
    return servidores.filter((servidor) =>
      servidor.nome.toLowerCase().includes(searchLower)
    );
  }, [servidores, searchTerm]);

  const deleteServidorAction = useAction(deleteServidor, {
    onSuccess: () => {
      toast.success("Servidor excluído com sucesso");
      loadServidores();
    },
    onError: () => {
      toast.error("Erro ao excluir servidor");
    },
  });

  const handleDeleteServidorClick = (servidorId: string) => {
    deleteServidorAction.execute({ id: servidorId });
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando servidores...
      </div>
    );
  }

  const hasSearchResults = searchTerm && filteredServidores.length > 0;
  const firstResult = hasSearchResults ? filteredServidores[0] : null;
  const otherResults = hasSearchResults ? filteredServidores.slice(1) : filteredServidores;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Função</TableHead>
            <TableHead>VM</TableHead>
            <TableHead>Editado por</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredServidores.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Nenhum servidor encontrado.
              </TableCell>
            </TableRow>
          ) : (
            <>
              {firstResult && (
                <TableRow style={{ backgroundColor: "#b7bbe8" }}>
                  <TableCell className="font-medium">{firstResult.nome}</TableCell>
                  <TableCell>{firstResult.funcao}</TableCell>
                  <TableCell>{firstResult.vm}</TableCell>
                  <TableCell>{firstResult.editadoPor}</TableCell>
                  <TableCell className="text-right">
                    <ServidoresTableActions
                      servidor={firstResult}
                      onDelete={handleDeleteServidorClick}
                      onEditSuccess={loadServidores}
                    />
                  </TableCell>
                </TableRow>
              )}
              {otherResults.map((servidor) => (
                <ServidoresTableRow
                  key={servidor.id}
                  servidor={servidor}
                  onDelete={handleDeleteServidorClick}
                  onEditSuccess={loadServidores}
                />
              ))}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ServidoresTable;

