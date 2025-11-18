"use client";

import { TableCell, TableRow } from "@/components/ui/table";

import MonitoresTableActions from "./monitores-table-actions";

interface MonitoresTableRowProps {
  monitor: {
    id: string;
    marca: string;
    modelo: string;
    usuarioNome: string;
    localidadeNome: string;
    editadoPor: string;
  };
  onDelete: (id: string) => void;
  onEditSuccess?: () => void;
}

const MonitoresTableRow = ({
  monitor,
  onDelete,
  onEditSuccess,
}: MonitoresTableRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{monitor.marca}</TableCell>
      <TableCell>{monitor.modelo}</TableCell>
      <TableCell>{monitor.usuarioNome}</TableCell>
      <TableCell>{monitor.localidadeNome}</TableCell>
      <TableCell>{monitor.editadoPor}</TableCell>
      <TableCell className="text-right">
        <MonitoresTableActions
          monitor={monitor}
          onDelete={onDelete}
          onEditSuccess={onEditSuccess}
        />
      </TableCell>
    </TableRow>
  );
};

export default MonitoresTableRow;

