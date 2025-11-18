import { z } from "zod";

export const upsertLocalidadeSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  endereco: z.string().optional(),
});

export type UpsertLocalidadeSchema = z.infer<typeof upsertLocalidadeSchema>;

