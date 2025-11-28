"use client";

import { TableCell, TableRow } from "@/components/ui/table";

import ComputadoresTableActions from "./computadores-table-actions";

interface ComputadoresTableRowProps {
  computador: {
    id: string;
    nome: string;
    marca: string;
    modelo: string;
    manutencao: boolean;
    localidadeNome: string;
    usuarioNome: string;
    editadoPor: string;
  };
  onDelete: (id: string) => void;
  onEditSuccess?: () => void;
}

const ComputadoresTableRow = ({
  computador,
  onDelete,
  onEditSuccess,
}: ComputadoresTableRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{computador.nome}</TableCell>
      <TableCell>{computador.marca}</TableCell>
      <TableCell>{computador.modelo}</TableCell>
      <TableCell>{computador.usuarioNome}</TableCell>
      <TableCell>{computador.localidadeNome}</TableCell>
      <TableCell>{computador.manutencao ? "Sim" : "Não"}</TableCell>
      <TableCell>{computador.editadoPor}</TableCell>
      <TableCell className="text-right">
        <ComputadoresTableActions
          computador={computador}
          onDelete={onDelete}
          onEditSuccess={onEditSuccess}
        />
      </TableCell>
    </TableRow>
  );
};

export default ComputadoresTableRow;

