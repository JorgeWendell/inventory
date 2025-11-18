import { z } from "zod";

import { materiaisCategorias } from "@/constants/materiais-de-ti";

export const upsertMaterialTiSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  categoria: z.enum(materiaisCategorias, {
    errorMap: () => ({ message: "Categoria inválida" }),
  }),
  estoqueMin: z.coerce
    .number()
    .int()
    .min(0, { message: "Estoque mínimo deve ser maior ou igual a zero" }),
  estoqueAtual: z.coerce
    .number()
    .int()
    .min(0, { message: "Estoque atual deve ser maior ou igual a zero" }),
  localidadeNome: z
    .string()
    .min(1, { message: "Localidade inválida" })
    .optional()
    .nullable(),
});

export type UpsertMaterialTiSchema = z.infer<typeof upsertMaterialTiSchema>;


