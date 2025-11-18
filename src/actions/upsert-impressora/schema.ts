import { z } from "zod";

export const upsertImpressoraSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  localidadeNome: z.string().optional(),
  manutencao: z.boolean().default(false),
  toners: z
    .array(
      z.object({
        tonerNome: z.string(),
        quantidade: z.number().int().min(1).default(1),
      }),
    )
    .default([]),
});

export type UpsertImpressoraSchema = z.infer<typeof upsertImpressoraSchema>;

