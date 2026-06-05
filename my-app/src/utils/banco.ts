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

export const BANK_COLORS: Record<string, string> = {
  nubank: "#820AD1",
  itau: "#EC7000",
  bradesco: "#CC092F",
  santander: "#EC0000",
  inter: "#FF7A00",
  bancodobrasil: "#003D7A",
  caixa: "#0066A1",
  btg: "#001E62",
  xp: "#000000",
  c6: "#121212",
  neon: "#161C3E",
  pan: "#003087",
  picpay: "#21C25E",
  mercadopago: "#00BCFF",
  pagbank: "#42A936",
  cora: "#FE3E6D",
  digio: "#00275C",
  sicoob: "#003B43",
  safra: "#151D43",
  next: "#00C45A",
  original: "#00A857",
  infinitepay: "#171527",
};

export function getBankColor(name: string): string {
  const key = name.toLowerCase().replace(/\s/g, "");
  return BANK_COLORS[key] ?? "#22D3EE";
}

export function getBancoNomeSafe(name: string): string {
  const key = name.toLowerCase().replace(/\s/g, "");
  return isBancoNome(key) ? key : "nubank";
}
