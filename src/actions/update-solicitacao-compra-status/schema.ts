import { z } from "zod";

import { solicitacaoCompraStatus } from "@/constants/solicitacao-compra";

export const updateSolicitacaoCompraStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(solicitacaoCompraStatus),
});

export type UpdateSolicitacaoCompraStatusSchema = z.infer<
  typeof updateSolicitacaoCompraStatusSchema
>;


