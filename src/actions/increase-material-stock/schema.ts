import { z } from "zod";

export const increaseMaterialStockSchema = z.object({
  id: z.string().uuid(),
  amount: z.coerce
    .number()
    .int()
    .min(1, { message: "Quantidade deve ser maior que zero" }),
});

export type IncreaseMaterialStockSchema = z.infer<
  typeof increaseMaterialStockSchema
>;


