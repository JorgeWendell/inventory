"use server";

import crypto from "crypto";

import { db } from "@/db";
import { notificacoesTable } from "@/db/schema";

interface CreateNotificacaoParams {
  userId: string;
  tipo: "estoque_baixo" | "solicitacao_pendente" | "pedido_pendente" | "sistema";
  titulo: string;
  mensagem: string;
  link?: string;
  prioridade?: "baixa" | "normal" | "alta" | "critica";
  entidadeId?: string;
}

export async function createNotificacao({
  userId,
  tipo,
  titulo,
  mensagem,
  link,
  prioridade = "normal",
  entidadeId,
}: CreateNotificacaoParams) {
  const id = crypto.randomUUID();

  await db.insert(notificacoesTable).values({
    id,
    userId,
    tipo,
    titulo,
    mensagem,
    link: link || null,
    prioridade,
    entidadeId: entidadeId || null,
    lida: false,
    createdAt: new Date(),
  });

  return { id };
}

