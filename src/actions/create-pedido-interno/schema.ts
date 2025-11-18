import { z } from "zod";

export const createPedidoInternoSchema = z.object({
  tipoProduto: z.enum(["MATERIAL_TI", "TONER"]),
  produtoId: z.string().min(1, { message: "Produto é obrigatório" }),
  quantidade: z.coerce
    .number()
    .int()
    .min(1, { message: "Quantidade deve ser maior que zero" }),
  localidadeNome: z.string().optional().nullable(),
  impressoraNome: z.string().optional().nullable(),
  cor: z.enum(["Preta", "Amarela", "Magenta", "Azul"]).optional().nullable(),
});

export type CreatePedidoInternoSchema = z.infer<
  typeof createPedidoInternoSchema
>;

