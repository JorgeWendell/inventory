"use client";

import { TableCell, TableRow } from "@/components/ui/table";

import TonersTableActions from "./toners-table-actions";

interface TonersTableRowProps {
  toner: {
    id: string;
    nome: string;
    cor: string;
    impressoraNome: string;
    localidadeNome: string;
    estoqueAtual: number;
    editadoPor: string;
  };
  onEditSuccess?: () => void;
}

const TonersTableRow = ({
  toner,
  onEditSuccess,
}: TonersTableRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{toner.nome}</TableCell>
      <TableCell>{toner.cor}</TableCell>
      <TableCell>{toner.impressoraNome}</TableCell>
      <TableCell>{toner.localidadeNome}</TableCell>
      <TableCell>{toner.estoqueAtual}</TableCell>
      <TableCell>{toner.editadoPor}</TableCell>
      <TableCell className="text-right">
        <TonersTableActions toner={toner} onEditSuccess={onEditSuccess} />
      </TableCell>
    </TableRow>
  );
};

export default TonersTableRow;

