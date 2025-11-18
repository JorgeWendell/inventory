import { TableCell, TableRow } from "@/components/ui/table";

import StatusBadge from "./status-badge";
import SolicitacoesTableActions from "./solicitacoes-table-actions";
import { SolicitacaoCompraTableData } from "./solicitacoes-table";

interface SolicitacoesTableRowProps {
  solicitacao: SolicitacaoCompraTableData;
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

const SolicitacoesTableRow = ({
  solicitacao,
  onRefresh,
}: SolicitacoesTableRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{solicitacao.material.nome}</TableCell>
      <TableCell>{solicitacao.material.categoria}</TableCell>
      <TableCell>{solicitacao.material.estoqueMin}</TableCell>
      <TableCell>{solicitacao.material.estoqueAtual}</TableCell>
      <TableCell>{solicitacao.material.localidade}</TableCell>
      <TableCell>
        {solicitacao.cotacaoSelecionada
          ? solicitacao.cotacaoSelecionada.fornecedorNome
          : "-"}
      </TableCell>
      <TableCell>{solicitacao.recebidoPor || "-"}</TableCell>
      <TableCell>
        {formatDateBR(solicitacao.dataRecebimento)}
      </TableCell>
      <TableCell>
        <StatusBadge status={solicitacao.status} />
      </TableCell>
      <TableCell>{solicitacao.editadoPor}</TableCell>
      <TableCell className="text-right">
        <SolicitacoesTableActions
          solicitacao={solicitacao}
          onUpdated={onRefresh}
        />
      </TableCell>
    </TableRow>
  );
};

export default SolicitacoesTableRow;


