"use client";

import { TableCell, TableRow } from "@/components/ui/table";

import LocalidadesTableActions from "./localidades-table-actions";

interface LocalidadesTableRowProps {
  localidade: {
    id: string;
    nome: string;
    endereco: string;
    editadoPor: string;
  };
  onDelete: (id: string) => void;
  onEditSuccess?: () => void;
}

const LocalidadesTableRow = ({
  localidade,
  onDelete,
  onEditSuccess,
}: LocalidadesTableRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{localidade.nome}</TableCell>
      <TableCell>{localidade.endereco}</TableCell>
      <TableCell>{localidade.editadoPor}</TableCell>
      <TableCell className="text-right">
        <LocalidadesTableActions
          localidade={localidade}
          onDelete={onDelete}
          onEditSuccess={onEditSuccess}
        />
      </TableCell>
    </TableRow>
  );
};

export default LocalidadesTableRow;

