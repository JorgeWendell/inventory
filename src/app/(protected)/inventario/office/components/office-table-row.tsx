"use client";

import { TableCell, TableRow } from "@/components/ui/table";

import OfficeTableActions from "./office-table-actions";

interface OfficeTableRowProps {
  office: {
    id: string;
    nome: string;
    senha: string;
    computadorNome: string;
    usuarioNome: string;
    editadoPor: string;
  };
  onDelete: (id: string) => void;
  onEditSuccess?: () => void;
}

const OfficeTableRow = ({
  office,
  onDelete,
  onEditSuccess,
}: OfficeTableRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{office.nome}</TableCell>
      <TableCell>{office.senha}</TableCell>
      <TableCell>{office.computadorNome}</TableCell>
      <TableCell>{office.usuarioNome}</TableCell>
      <TableCell>{office.editadoPor}</TableCell>
      <TableCell className="text-right">
        <OfficeTableActions
          office={office}
          onDelete={onDelete}
          onEditSuccess={onEditSuccess}
        />
      </TableCell>
    </TableRow>
  );
};

export default OfficeTableRow;

