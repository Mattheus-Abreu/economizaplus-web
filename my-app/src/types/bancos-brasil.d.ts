declare module "@edusites/bancos-brasil" {
  export type BancoNome =
    | "bancodobrasil"
    | "bradesco"
    | "btg"
    | "c6"
    | "caixa"
    | "cora"
    | "digio"
    | "infinitepay"
    | "inter"
    | "itau"
    | "mercadopago"
    | "neon"
    | "nubank"
    | "pagbank"
    | "pan"
    | "picpay"
    | "safra"
    | "santander"
    | "sicoob"
    | "xp";

  export type BancoFormato = "quadrado" | "circulo" | "sem";
  

  export interface SvgBancoOptions {
    nome: BancoNome;
    formato?: BancoFormato;
    cor?: string;
    fundo?: string;
    tamanho?: number;
    className?: string;
  }

  export function svgBanco(options: SvgBancoOptions): string;
}

declare module "@edusites/bancos-brasil";
