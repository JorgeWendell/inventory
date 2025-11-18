import { z } from "zod";

export const upsertNobreakSchema = z.object({
  id: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  capacidade: z.string().optional(),
  localidadeNome: z.string().optional(),
  usuarioNome: z.string().optional(),
  computadoresNome: z.string().optional(),
});

export type UpsertNobreakSchema = z.infer<typeof upsertNobreakSchema>;

