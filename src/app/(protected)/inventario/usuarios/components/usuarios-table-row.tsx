"use client";

import { TableCell, TableRow } from "@/components/ui/table";

import UsuariosTableActions from "./usuarios-table-actions";

interface UsuariosTableRowProps {
  usuario: {
    id: string;
    login: string;
    nome: string;
    depto: string;
    localidadeNome: string;
    editadoPor: string;
  };
  onDelete: (id: string) => void;
  onEditSuccess?: () => void;
}

const UsuariosTableRow = ({
  usuario,
  onDelete,
  onEditSuccess,
}: UsuariosTableRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{usuario.login}</TableCell>
      <TableCell>{usuario.nome}</TableCell>
      <TableCell>{usuario.depto}</TableCell>
      <TableCell>{usuario.localidadeNome}</TableCell>
      <TableCell>{usuario.editadoPor}</TableCell>
      <TableCell className="text-right">
        <UsuariosTableActions
          usuario={usuario}
          onDelete={onDelete}
          onEditSuccess={onEditSuccess}
        />
      </TableCell>
    </TableRow>
  );
};

export default UsuariosTableRow;

