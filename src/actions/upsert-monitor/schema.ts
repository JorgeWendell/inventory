import { z } from "zod";

export const upsertMonitorSchema = z.object({
  id: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  localidadeNome: z.string().optional(),
  usuarioNome: z.string().optional(),
});

export type UpsertMonitorSchema = z.infer<typeof upsertMonitorSchema>;

