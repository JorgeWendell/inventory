import { z } from "zod";

export const updatePedidoInternoStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["AGUARDANDO", "ENVIADO", "RECEBIDO"]),
  enviadoPor: z.string().optional().nullable(),
  dataEnvio: z.string().optional().nullable(),
  recebidoPor: z.string().optional().nullable(),
  dataRecebimento: z.string().optional().nullable(),
});

export type UpdatePedidoInternoStatusSchema = z.infer<
  typeof updatePedidoInternoStatusSchema
>;

