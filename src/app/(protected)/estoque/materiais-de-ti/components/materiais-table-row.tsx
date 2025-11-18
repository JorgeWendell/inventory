import { TableCell, TableRow } from "@/components/ui/table";

import MateriaisTableActions from "./materiais-table-actions";

interface MaterialTableData {
  id: string;
  nome: string;
  categoria: string;
  estoqueMin: number;
  estoqueAtual: number;
  localidadeNome: string;
  editadoPor: string;
}

interface MateriaisTableRowProps {
  material: MaterialTableData;
  onStockUpdated?: () => void;
}

const MateriaisTableRow = ({
  material,
  onStockUpdated,
}: MateriaisTableRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{material.nome}</TableCell>
      <TableCell>{material.categoria}</TableCell>
      <TableCell>{material.estoqueMin}</TableCell>
      <TableCell>{material.estoqueAtual}</TableCell>
      <TableCell>{material.localidadeNome}</TableCell>
      <TableCell>{material.editadoPor}</TableCell>
      <TableCell className="text-right">
        <MateriaisTableActions
          material={{ id: material.id, nome: material.nome }}
          onStockUpdated={onStockUpdated}
        />
      </TableCell>
    </TableRow>
  );
};

export default MateriaisTableRow;


