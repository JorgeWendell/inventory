import { z } from "zod";

export const markSolicitacaoCompraCompradoSchema = z.object({
  id: z.string().uuid(),
  cotacaoId: z.string().uuid(),
});

export type MarkSolicitacaoCompraCompradoSchema = z.infer<
  typeof markSolicitacaoCompraCompradoSchema
>;


