import { TableCell, TableRow } from "@/components/ui/table";

import { LogTableData } from "./logs-table";

interface LogsTableRowProps {
  log: LogTableData;
}

// Função para formatar data considerando GMT-3 (America/Sao_Paulo)
const formatDateBR = (dateString: string): string => {
  const date = new Date(dateString);

  return date.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// Função para formatar tipo
const formatTipo = (tipo: string): string => {
  const tipos: Record<string, string> = {
    solicitacao_compra: "Solicitação de Compra",
    pedido_interno: "Pedido Interno",
    material_ti: "Material de TI",
    toner: "Toner",
    impressora: "Impressora",
    computador: "Computador",
    monitor: "Monitor",
    nobreak: "Nobreak",
    camera: "Câmera",
    usuario: "Usuário",
    localidade: "Localidade",
  };
  return tipos[tipo] || tipo;
};

// Função para formatar ação
const formatAcao = (acao: string): string => {
  const acoes: Record<string, string> = {
    criado: "Criado",
    atualizado: "Atualizado",
    deletado: "Deletado",
    status_alterado: "Status Alterado",
    estoque_atualizado: "Estoque Atualizado",
  };
  return acoes[acao] || acao;
};

const LogsTableRow = ({ log }: LogsTableRowProps) => {
  return (
    <TableRow>
      <TableCell>{formatDateBR(log.createdAt)}</TableCell>
      <TableCell>{formatTipo(log.tipo)}</TableCell>
      <TableCell>{formatAcao(log.acao)}</TableCell>
      <TableCell className="max-w-md truncate">{log.descricao}</TableCell>
      <TableCell>{log.usuario}</TableCell>
    </TableRow>
  );
};

export default LogsTableRow;

