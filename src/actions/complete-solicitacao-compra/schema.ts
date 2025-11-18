import { z } from "zod";

export const completeSolicitacaoCompraSchema = z.object({
  id: z.string().uuid(),
  recebidoPor: z.string().min(1, { message: "Informe quem recebeu" }),
  dataRecebimento: z.string().min(1, { message: "Informe a data de recebimento" }),
  numeroNotaFiscal: z.string().optional().nullable(),
});

export type CompleteSolicitacaoCompraSchema = z.infer<
  typeof completeSolicitacaoCompraSchema
>;


