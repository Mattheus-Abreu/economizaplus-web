export const bancosValidos = [
  "bancodobrasil",
  "bradesco",
  "btg",
  "c6",
  "caixa",
  "cora",
  "digio",
  "infinitepay",
  "inter",
  "itau",
  "mercadopago",
  "neon",
  "nubank",
  "pagbank",
  "pan",
  "picpay",
  "safra",
  "santander",
  "sicoob",
  "xp",
] as const;

export type BancoNome = typeof bancosValidos[number];

export function isBancoNome(value: string): value is BancoNome {
  return bancosValidos.includes(value as BancoNome);
}