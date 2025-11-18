"use server";

import { db } from "@/db";
import {
  computadoresTable,
  monitorTable,
  tonerTable,
  nobreakTable,
  camerasTable,
  servidorTable,
  officeTable,
  usersTable,
} from "@/db/schema";
import { inArray } from "drizzle-orm";

export async function getRelatorioInventario() {
  const [
    computadores,
    monitores,
    toners,
    nobreaks,
    cameras,
    servidores,
    offices,
  ] = await Promise.all([
    db.select().from(computadoresTable),
    db.select().from(monitorTable),
    db.select().from(tonerTable),
    db.select().from(nobreakTable),
    db.select().from(camerasTable),
    db.select().from(servidorTable),
    db.select().from(officeTable),
  ]);

  // Buscar nomes dos usuários para updateUserId
  const userIds = new Set<string>();
  computadores.forEach((c) => c.updateUserId && userIds.add(c.updateUserId));
  monitores.forEach((m) => m.updateUserId && userIds.add(m.updateUserId));
  toners.forEach((t) => t.updateUserId && userIds.add(t.updateUserId));
  nobreaks.forEach((n) => n.updateUserId && userIds.add(n.updateUserId));
  cameras.forEach((c) => c.updateUserId && userIds.add(c.updateUserId));
  servidores.forEach((s) => s.updateUserId && userIds.add(s.updateUserId));
  offices.forEach((o) => o.updateUserId && userIds.add(o.updateUserId));

  let usersMap = new Map<string, string>();
  if (userIds.size > 0) {
    const users = await db
      .select({ id: usersTable.id, name: usersTable.name })
      .from(usersTable)
      .where(inArray(usersTable.id, Array.from(userIds)));

    usersMap = new Map(users.map((u) => [u.id, u.name]));
  }

  return {
    computadores: computadores.map((c) => ({
      tipo: "Computador",
      nome: c.nome,
      localidade: c.localidadeNome || "N/A",
      usuario: c.usuarioNome || "N/A",
      atualizadoPor: c.updateUserId ? usersMap.get(c.updateUserId) || "N/A" : "N/A",
    })),
    monitores: monitores.map((m) => ({
      tipo: "Monitor",
      marca: m.marca || "N/A",
      modelo: m.modelo || "N/A",
      localidade: m.localidadeNome || "N/A",
      usuario: m.usuarioNome || "N/A",
      atualizadoPor: m.updateUserId ? usersMap.get(m.updateUserId) || "N/A" : "N/A",
    })),
    toners: toners.map((t) => ({
      tipo: "Toner",
      nome: t.nome,
      cor: t.cor || "N/A",
      localidade: t.localidadeNome || "N/A",
      impressora: t.impressoraNome || "N/A",
      estoqueAtual: t.estoqueAtual,
      estoqueMin: t.estoqueMin,
      atualizadoPor: t.updateUserId ? usersMap.get(t.updateUserId) || "N/A" : "N/A",
    })),
    nobreaks: nobreaks.map((n) => ({
      tipo: "Nobreak",
      marca: n.marca || "N/A",
      modelo: n.modelo || "N/A",
      capacidade: n.capacidade || "N/A",
      localidade: n.localidadeNome || "N/A",
      usuario: n.usuarioNome || "N/A",
      computador: n.computadoresNome || "N/A",
      atualizadoPor: n.updateUserId ? usersMap.get(n.updateUserId) || "N/A" : "N/A",
    })),
    cameras: cameras.map((c) => ({
      tipo: "Câmera",
      nome: c.nome,
      localidade: c.localidade || "N/A",
      quantidadeCameras: c.quantidadeCameras || 1,
      intelbrasId: c.intelbrasId || "N/A",
      atualizadoPor: c.updateUserId ? usersMap.get(c.updateUserId) || "N/A" : "N/A",
    })),
    servidores: servidores.map((s) => ({
      tipo: "Servidor",
      nome: s.nome,
      vm: s.vm,
      funcao: s.funcao || "N/A",
      memoria: s.memoria || "N/A",
      atualizadoPor: s.updateUserId ? usersMap.get(s.updateUserId) || "N/A" : "N/A",
    })),
    offices: offices.map((o) => ({
      tipo: "Office",
      nomeO365: o.nomeO365,
      computador: o.computadorNome,
      usuario: o.usuarioNome || "N/A",
      atualizadoPor: o.updateUserId ? usersMap.get(o.updateUserId) || "N/A" : "N/A",
    })),
  };
}

