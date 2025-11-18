import { z } from "zod";

export const upsertServidorSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  memoria: z.string().optional(),
  disco1: z.string().optional(),
  disco2: z.string().optional(),
  disco3: z.string().optional(),
  disco4: z.string().optional(),
  disco5: z.string().optional(),
  vm: z.boolean().default(false),
  funcao: z.string().optional(),
});

export type UpsertServidorSchema = z.infer<typeof upsertServidorSchema>;

