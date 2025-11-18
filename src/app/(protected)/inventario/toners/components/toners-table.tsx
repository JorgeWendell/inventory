"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTonersTable } from "@/actions/get-toners-table";

import TonersTableRow from "./toners-table-row";
import TonersTableActions from "./toners-table-actions";

interface TonerTableData {
  id: string;
  nome: string;
  cor: string;
  impressoraNome: string;
  localidadeNome: string;
  estoqueAtual: number;
  editadoPor: string;
}

interface TonersTableProps {
  refreshKey?: number;
  searchTerm?: string;
}

const TonersTable = ({ refreshKey, searchTerm = "" }: TonersTableProps) => {
  const [toners, setToners] = useState<TonerTableData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadToners = () => {
    setLoading(true);
    getTonersTable()
      .then(setToners)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadToners();
  }, [refreshKey]);

  const filteredToners = useMemo(() => {
    if (!searchTerm) return toners;

    const searchLower = searchTerm.toLowerCase();
    return toners.filter(
      (toner) =>
        toner.nome.toLowerCase().includes(searchLower) ||
        toner.cor.toLowerCase().includes(searchLower) ||
        toner.localidadeNome.toLowerCase().includes(searchLower)
    );
  }, [toners, searchTerm]);

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando toners...
      </div>
    );
  }

  const hasSearchResults = searchTerm && filteredToners.length > 0;
  const firstResult = hasSearchResults ? filteredToners[0] : null;
  const otherResults = hasSearchResults ? filteredToners.slice(1) : filteredToners;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Cor</TableHead>
            <TableHead>Impressora</TableHead>
            <TableHead>Localidade</TableHead>
            <TableHead>Estoque atual</TableHead>
            <TableHead>Editado por</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredToners.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Nenhum toner encontrado.
              </TableCell>
            </TableRow>
          ) : (
            <>
              {firstResult && (
                <TableRow style={{ backgroundColor: "#b7bbe8" }}>
                  <TableCell className="font-medium">{firstResult.nome}</TableCell>
                  <TableCell>{firstResult.cor}</TableCell>
                  <TableCell>{firstResult.impressoraNome}</TableCell>
                  <TableCell>{firstResult.localidadeNome}</TableCell>
                  <TableCell>{firstResult.estoqueAtual}</TableCell>
                  <TableCell>{firstResult.editadoPor}</TableCell>
                  <TableCell className="text-right">
                    <TonersTableActions
                      toner={firstResult}
                      onEditSuccess={loadToners}
                    />
                  </TableCell>
                </TableRow>
              )}
              {otherResults.map((toner) => (
                <TonersTableRow
                  key={toner.id}
                  toner={toner}
                  onEditSuccess={loadToners}
                />
              ))}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TonersTable;

