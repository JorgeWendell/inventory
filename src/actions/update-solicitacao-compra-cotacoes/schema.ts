import { z } from "zod";

export const updateSolicitacaoCompraCotacoesSchema = z.object({
  id: z.string().uuid(),
  cotacoesNotas: z.string().optional().nullable(),
});

export type UpdateSolicitacaoCompraCotacoesSchema = z.infer<
  typeof updateSolicitacaoCompraCotacoesSchema
>;


