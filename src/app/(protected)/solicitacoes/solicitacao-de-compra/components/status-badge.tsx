import { Badge } from "@/components/ui/badge";
import { solicitacaoCompraStatusLabel } from "@/constants/solicitacao-compra";

interface StatusBadgeProps {
  status: keyof typeof solicitacaoCompraStatusLabel;
}

const statusVariant: Record<
  StatusBadgeProps["status"],
  "default" | "secondary" | "outline"
> = {
  EM_ANDAMENTO: "default",
  AGUARDANDO_ENTREGA: "secondary",
  COMPRADO: "secondary",
  CONCLUIDO: "outline",
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <Badge variant={statusVariant[status]}>
      {solicitacaoCompraStatusLabel[status]}
    </Badge>
  );
};

export default StatusBadge;


