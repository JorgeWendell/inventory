"use client";

import { TableCell, TableRow } from "@/components/ui/table";

import ServidoresTableActions from "./servidores-table-actions";

interface ServidoresTableRowProps {
  servidor: {
    id: string;
    nome: string;
    funcao: string;
    vm: string;
    editadoPor: string;
  };
  onDelete: (id: string) => void;
  onEditSuccess?: () => void;
}

const ServidoresTableRow = ({
  servidor,
  onDelete,
  onEditSuccess,
}: ServidoresTableRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{servidor.nome}</TableCell>
      <TableCell>{servidor.funcao}</TableCell>
      <TableCell>{servidor.vm}</TableCell>
      <TableCell>{servidor.editadoPor}</TableCell>
      <TableCell className="text-right">
        <ServidoresTableActions
          servidor={servidor}
          onDelete={onDelete}
          onEditSuccess={onEditSuccess}
        />
      </TableCell>
    </TableRow>
  );
};

export default ServidoresTableRow;

