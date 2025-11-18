import { z } from "zod";

export const upsertOfficeSchema = z.object({
  id: z.string().optional(),
  nomeO365: z.string().min(1, { message: "Nome O365 é obrigatório" }),
  senha: z.string().optional(),
  computadorNome: z.string().min(1, { message: "Computador é obrigatório" }),
  usuarioNome: z.string().optional(),
});

export type UpsertOfficeSchema = z.infer<typeof upsertOfficeSchema>;

