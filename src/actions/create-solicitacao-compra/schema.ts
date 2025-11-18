import { z } from "zod";

const coresEnum = z.enum(["Preta", "Amarela", "Magenta", "Azul"]);

export const createSolicitacaoCompraSchema = z
  .object({
    tipoProduto: z.enum(["MATERIAL_TI", "TONER"]),
    materialId: z.string().uuid().optional(),
    tonerId: z.string().uuid().optional(),
    cor: coresEnum.optional(),
    quantidade: z.coerce
      .number()
      .int()
      .min(1, { message: "Quantidade deve ser maior que zero" })
      .default(1),
  })
  .refine(
    (data) => {
      if (data.tipoProduto === "MATERIAL_TI") {
        return !!data.materialId;
      }
      return true;
    },
    {
      message: "Material é obrigatório",
      path: ["materialId"],
    },
  )
  .refine(
    (data) => {
      if (data.tipoProduto === "TONER") {
        return !!data.tonerId && !!data.cor;
      }
      return true;
    },
    {
      message: "Toner e cor são obrigatórios",
      path: ["tonerId"],
    },
  );

export type CreateSolicitacaoCompraSchema = z.infer<
  typeof createSolicitacaoCompraSchema
>;


