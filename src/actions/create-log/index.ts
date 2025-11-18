"use server";

import crypto from "crypto";

import { db } from "@/db";
import { logsTable } from "@/db/schema";

interface CreateLogParams {
  tipo: string;
  entidadeId: string;
  acao: string;
  descricao?: string;
  dadosAnteriores?: unknown;
  dadosNovos?: unknown;
  updateUserId: string;
}

export async function createLog({
  tipo,
  entidadeId,
  acao,
  descricao,
  dadosAnteriores,
  dadosNovos,
  updateUserId,
}: CreateLogParams) {
  const id = crypto.randomUUID();

  await db.insert(logsTable).values({
    id,
    tipo,
    entidadeId,
    acao,
    descricao: descricao || null,
    dadosAnteriores: dadosAnteriores
      ? JSON.stringify(dadosAnteriores)
      : null,
    dadosNovos: dadosNovos ? JSON.stringify(dadosNovos) : null,
    updateUserId,
    createdAt: new Date(),
  });
}

