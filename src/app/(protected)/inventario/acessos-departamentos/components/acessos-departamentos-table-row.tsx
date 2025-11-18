"use client";

import { TableCell, TableRow } from "@/components/ui/table";

import AcessosDepartamentosTableActions from "./acessos-departamentos-table-actions";

interface AcessosDepartamentosTableRowProps {
  acessoDepartamento: {
    id: string;
    usuarioLogin: string;
    computadorNome: string;
    pastaDepartamentos: string;
    editadoPor: string;
  };
  onDelete: (id: string) => void;
  onEditSuccess?: () => void;
}

const AcessosDepartamentosTableRow = ({
  acessoDepartamento,
  onDelete,
  onEditSuccess,
}: AcessosDepartamentosTableRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{acessoDepartamento.usuarioLogin}</TableCell>
      <TableCell>{acessoDepartamento.computadorNome}</TableCell>
      <TableCell>{acessoDepartamento.pastaDepartamentos}</TableCell>
      <TableCell>{acessoDepartamento.editadoPor}</TableCell>
      <TableCell className="text-right">
        <AcessosDepartamentosTableActions
          acessoDepartamento={acessoDepartamento}
          onDelete={onDelete}
          onEditSuccess={onEditSuccess}
        />
      </TableCell>
    </TableRow>
  );
};

export default AcessosDepartamentosTableRow;

