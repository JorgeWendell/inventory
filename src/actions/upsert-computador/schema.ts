import { z } from "zod";

export const upsertComputadorSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  processador: z.string().optional(),
  memoria: z.string().optional(),
  disco: z.string().optional(),
  garantia: z.string().optional(),
  manutencao: z.boolean().optional(),
  localidadeNome: z.string().optional(),
  usuarioNome: z.string().optional(),
});

export type UpsertComputadorSchema = z.infer<typeof upsertComputadorSchema>;

