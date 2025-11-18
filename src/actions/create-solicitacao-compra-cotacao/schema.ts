import { z } from "zod";

export const createSolicitacaoCompraCotacaoSchema = z.object({
  solicitacaoCompraId: z.string().uuid(),
  fornecedorNome: z.string().min(1, { message: "Fornecedor é obrigatório" }),
  fornecedorCnpj: z
    .string()
    .min(11, { message: "CNPJ inválido" })
    .max(18)
    .nullable()
    .optional(),
  produtoDescricao: z.string().min(1, { message: "Produto é obrigatório" }),
  valor: z.coerce
    .number()
    .min(0.01, { message: "Valor deve ser maior que zero" }),
  quantidade: z.coerce
    .number()
    .int()
    .min(1, { message: "Quantidade deve ser maior que zero" }),
  prazoEntrega: z.string().optional().nullable(),
});

export type CreateSolicitacaoCompraCotacaoSchema = z.infer<
  typeof createSolicitacaoCompraCotacaoSchema
>;


