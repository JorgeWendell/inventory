"use client";

import { TableCell, TableRow } from "@/components/ui/table";

import NobreaksTableActions from "./nobreaks-table-actions";

interface NobreaksTableRowProps {
  nobreak: {
    id: string;
    marca: string;
    modelo: string;
    capacidade: string;
    localidadeNome: string;
    usuarioNome: string;
    computadoresNome: string;
    editadoPor: string;
  };
  onDelete: (id: string) => void;
  onEditSuccess?: () => void;
}

const NobreaksTableRow = ({
  nobreak,
  onDelete,
  onEditSuccess,
}: NobreaksTableRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{nobreak.marca}</TableCell>
      <TableCell>{nobreak.modelo}</TableCell>
      <TableCell>{nobreak.capacidade}</TableCell>
      <TableCell>{nobreak.localidadeNome}</TableCell>
      <TableCell>{nobreak.usuarioNome}</TableCell>
      <TableCell>{nobreak.computadoresNome}</TableCell>
      <TableCell>{nobreak.editadoPor}</TableCell>
      <TableCell className="text-right">
        <NobreaksTableActions
          nobreak={nobreak}
          onDelete={onDelete}
          onEditSuccess={onEditSuccess}
        />
      </TableCell>
    </TableRow>
  );
};

export default NobreaksTableRow;

