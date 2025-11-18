export const solicitacaoCompraStatus = [
  "EM_ANDAMENTO",
  "AGUARDANDO_ENTREGA",
  "COMPRADO",
  "CONCLUIDO",
] as const;

export const solicitacaoCompraStatusLabel: Record<
  (typeof solicitacaoCompraStatus)[number],
  string
> = {
  EM_ANDAMENTO: "Em andamento",
  AGUARDANDO_ENTREGA: "Aguardando entrega",
  COMPRADO: "Comprado",
  CONCLUIDO: "Concluído",
};


