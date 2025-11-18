"use client";

import { TableCell, TableRow } from "@/components/ui/table";

import CamerasTableActions from "./cameras-table-actions";

interface CamerasTableRowProps {
  camera: {
    id: string;
    nome: string;
    intelbrasId: string;
    quantidadeCameras: number;
    nobreak: string;
    localidade: string;
    editadoPor: string;
  };
  onDelete: (id: string) => void;
  onEditSuccess?: () => void;
}

const CamerasTableRow = ({
  camera,
  onDelete,
  onEditSuccess,
}: CamerasTableRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{camera.nome}</TableCell>
      <TableCell>{camera.intelbrasId}</TableCell>
      <TableCell>{camera.quantidadeCameras}</TableCell>
      <TableCell>{camera.nobreak}</TableCell>
      <TableCell>{camera.localidade}</TableCell>
      <TableCell>{camera.editadoPor}</TableCell>
      <TableCell className="text-right">
        <CamerasTableActions
          camera={camera}
          onDelete={onDelete}
          onEditSuccess={onEditSuccess}
        />
      </TableCell>
    </TableRow>
  );
};

export default CamerasTableRow;

