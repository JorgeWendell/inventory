import { z } from "zod";

export const upsertUsuarioSchema = z.object({
  id: z.string().optional(),
  login: z.string().min(1, { message: "Login é obrigatório" }),
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  cargo: z.string().optional(),
  depto: z.string().optional(),
  localidadeNome: z.string().optional(),
});

export type UpsertUsuarioSchema = z.infer<typeof upsertUsuarioSchema>;

