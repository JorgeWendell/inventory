import { TableCell, TableRow } from "@/components/ui/table";

import StatusBadge from "./status-badge";
import PedidosInternosTableActions from "./pedidos-internos-table-actions";
import { PedidoInternoTableData } from "./pedidos-internos-table";

interface PedidosInternosTableRowProps {
  pedido: PedidoInternoTableData;
  onRefresh: () => void;
}

// Função para formatar data considerando GMT-3
const formatDateBR = (dateString: string | null): string => {
  if (!dateString) return "-";
  
  // Se já está no formato YYYY-MM-DD, converter diretamente
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  }
  
  // Se for uma data ISO, criar considerando timezone local
  const date = new Date(dateString);
  // Ajustar para GMT-3 (Brasil)
  const offset = -3 * 60; // GMT-3 em minutos
  const localDate = new Date(date.getTime() + (offset - date.getTimezoneOffset()) * 60000);
  
  return localDate.toLocaleDateString("pt-BR");
};

const PedidosInternosTableRow = ({
  pedido,
  onRefresh,
}: PedidosInternosTableRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{pedido.produto}</TableCell>
      <TableCell>{pedido.categoria}</TableCell>
      <TableCell>{pedido.quantidade}</TableCell>
      <TableCell>{pedido.localidadeNome}</TableCell>
      <TableCell>{pedido.impressoraNome}</TableCell>
      <TableCell>{pedido.cor}</TableCell>
      <TableCell>
        <StatusBadge status={pedido.status} />
      </TableCell>
      <TableCell>{pedido.recebidoPor || "-"}</TableCell>
      <TableCell>
        {formatDateBR(pedido.dataRecebimento)}
      </TableCell>
      <TableCell>{pedido.solicitante}</TableCell>
      <TableCell className="text-right">
        <PedidosInternosTableActions pedido={pedido} onUpdated={onRefresh} />
      </TableCell>
    </TableRow>
  );
};

export default PedidosInternosTableRow;

