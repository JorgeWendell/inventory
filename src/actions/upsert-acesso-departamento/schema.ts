import { z } from "zod";

export const upsertAcessoDepartamentoSchema = z.object({
  id: z.string().optional(),
  usuarioLogin: z.string().min(1, { message: "Usuário é obrigatório" }),
  computadorNome: z.string().min(1, { message: "Computador é obrigatório" }),
  pastaDepartamentos: z.enum([
    "Administracao",
    "Compras",
    "Contabil-Fiscal",
    "Dep.Pessoal",
    "Digitação",
    "Financeiro",
    "HD Externo",
    "Juridico",
    "Lista Operacional",
    "Notas Fiscais",
    "Operacional",
    "Porto Marina Resort",
    "TI",
    "Publico",
  ]),
  usuariosNome: z.array(z.string()).default([]),
});

export type UpsertAcessoDepartamentoSchema = z.infer<
  typeof upsertAcessoDepartamentoSchema
>;

