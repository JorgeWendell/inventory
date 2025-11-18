import { z } from "zod";

export const upsertCameraSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  localidade: z.string().optional(),
  quantidadeCameras: z.number().int().min(1).default(1),
  intelbrasId: z.string().optional(),
  nobreakId: z.string().optional(),
  usuariosNome: z.array(z.string()).default([]),
});

export type UpsertCameraSchema = z.infer<typeof upsertCameraSchema>;

