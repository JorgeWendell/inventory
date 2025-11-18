export const materiaisCategorias = [
  "Mouse",
  "Teclado",
  "Monitor",
  "Computador",
  "Nobreak",
  "Camera",
] as const;

export type MaterialCategoria = (typeof materiaisCategorias)[number];


