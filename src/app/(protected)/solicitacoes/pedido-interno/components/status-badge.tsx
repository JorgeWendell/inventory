import { Badge } from "@/components/ui/badge";
import { pedidoInternoStatusLabel } from "@/constants/pedido-interno";

interface StatusBadgeProps {
  status: keyof typeof pedidoInternoStatusLabel;
}

const statusVariant: Record<
  StatusBadgeProps["status"],
  "default" | "secondary" | "outline"
> = {
  AGUARDANDO: "default",
  ENVIADO: "secondary",
  RECEBIDO: "outline",
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <Badge variant={statusVariant[status]}>
      {pedidoInternoStatusLabel[status]}
    </Badge>
  );
};

export default StatusBadge;

