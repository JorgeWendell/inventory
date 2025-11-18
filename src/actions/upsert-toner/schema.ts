import { z } from "zod";

export const coresEnum = z.enum(["Preta", "Amarela", "Magenta", "Azul"]);

export const upsertTonerSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  cor: coresEnum.optional(),
  localidadeNome: z.string().optional(),
  impressoraNome: z.string().optional(),
  estoqueMin: z.number().int().min(0).default(0),
  estoqueAtual: z.number().int().min(0).default(0),
});

export type UpsertTonerSchema = z.infer<typeof upsertTonerSchema>;

