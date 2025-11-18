"use client";

import { TableCell, TableRow } from "@/components/ui/table";

import ImpressorasTableActions from "./impressoras-table-actions";

interface ImpressorasTableRowProps {
  impressora: {
    id: string;
    nome: string;
    marca: string;
    modelo: string;
    localidadeNome: string;
    manutencao: string;
    editadoPor: string;
  };
  onDelete: (id: string) => void;
  onEditSuccess?: () => void;
}

const ImpressorasTableRow = ({
  impressora,
  onDelete,
  onEditSuccess,
}: ImpressorasTableRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{impressora.nome}</TableCell>
      <TableCell>{impressora.marca}</TableCell>
      <TableCell>{impressora.modelo}</TableCell>
      <TableCell>{impressora.localidadeNome}</TableCell>
      <TableCell>{impressora.manutencao}</TableCell>
      <TableCell>{impressora.editadoPor}</TableCell>
      <TableCell className="text-right">
        <ImpressorasTableActions
          impressora={impressora}
          onDelete={onDelete}
          onEditSuccess={onEditSuccess}
        />
      </TableCell>
    </TableRow>
  );
};

export default ImpressorasTableRow;

