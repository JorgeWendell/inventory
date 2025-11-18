"use server";

import { db } from "@/db";
import {
  materiaisDeTiTable,
  pedidoInternoTable,
  tonerTable,
  usersTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getPedidosInternosTable() {
  const pedidos = await db
    .select({
      id: pedidoInternoTable.id,
      tipoProduto: pedidoInternoTable.tipoProduto,
      produtoId: pedidoInternoTable.produtoId,
      categoria: pedidoInternoTable.categoria,
      quantidade: pedidoInternoTable.quantidade,
      localidadeNome: pedidoInternoTable.localidadeNome,
      impressoraNome: pedidoInternoTable.impressoraNome,
      cor: pedidoInternoTable.cor,
      status: pedidoInternoTable.status,
      enviadoPor: pedidoInternoTable.enviadoPor,
      dataEnvio: pedidoInternoTable.dataEnvio,
      recebidoPor: pedidoInternoTable.recebidoPor,
      dataRecebimento: pedidoInternoTable.dataRecebimento,
      solicitanteEmail: usersTable.email,
      solicitanteNome: usersTable.name,
    })
    .from(pedidoInternoTable)
    .leftJoin(
      usersTable,
      eq(pedidoInternoTable.solicitanteId, usersTable.id),
    )
    .orderBy(pedidoInternoTable.createdAt);

  const pedidosComProduto = await Promise.all(
    pedidos.map(async (pedido) => {
      let produtoNome = "";
      let produtoCategoria = pedido.categoria || "";
      let produtoExiste = false;

      if (pedido.tipoProduto === "MATERIAL_TI") {
        const material = await db
          .select({
            nome: materiaisDeTiTable.nome,
            categoria: materiaisDeTiTable.categoria,
          })
          .from(materiaisDeTiTable)
          .where(eq(materiaisDeTiTable.id, pedido.produtoId))
          .limit(1);
        if (material.length > 0) {
          produtoNome = material[0].nome;
          produtoCategoria = material[0].categoria || produtoCategoria;
          produtoExiste = true;
        }
      } else if (pedido.tipoProduto === "TONER") {
        const toner = await db
          .select({
            nome: tonerTable.nome,
            cor: tonerTable.cor,
          })
          .from(tonerTable)
          .where(eq(tonerTable.id, pedido.produtoId))
          .limit(1);
        if (toner.length > 0) {
          produtoNome = toner[0].nome;
          produtoCategoria = "Toner";
          produtoExiste = true;
        }
      }

      // Se o produto não existe, forçar status para AGUARDANDO
      const statusFinal = produtoExiste ? pedido.status : "AGUARDANDO";

      return {
        id: pedido.id,
        produto: produtoNome || "Produto não encontrado",
        categoria: produtoCategoria,
        quantidade: pedido.quantidade,
        localidadeNome: pedido.localidadeNome || "-",
        impressoraNome: pedido.impressoraNome || "-",
        cor: pedido.cor || "-",
        status: statusFinal as "AGUARDANDO" | "ENVIADO" | "RECEBIDO",
        produtoExiste,
        enviadoPor: pedido.enviadoPor || null,
        dataEnvio: pedido.dataEnvio || null,
        recebidoPor: pedido.recebidoPor || null,
        dataRecebimento: pedido.dataRecebimento || null,
        solicitante: pedido.solicitanteNome || pedido.solicitanteEmail || "-",
      };
    }),
  );

  return pedidosComProduto;
}

