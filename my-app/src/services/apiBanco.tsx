import { svgBanco } from "@/services/bancos-brasil/core";
import { SvgFromXml } from "react-native-svg";

export type BancoNome =
  | "bancodobrasil" | "bradesco" | "btg" | "c6" | "caixa"
  | "cora" | "digio" | "infinitepay" | "inter" | "itau"
  | "mercadopago" | "neon" | "nubank" | "pagbank" | "pan"
  | "picpay" | "safra" | "santander" | "sicoob" | "xp";

type BancoIconProps = {
  nome: BancoNome;
  formato?: "quadrado" | "circulo" | "sem";
  cor?: string;
  fundo?: string;
  tamanho?: number;
};

export default function BancoIcon({
  nome,
  formato,
  cor,
  fundo,
  tamanho = 30,
}: BancoIconProps) {
  const svg = svgBanco({ nome, formato, cor, fundo, tamanho });
  if (!svg) return null;
  return <SvgFromXml xml={svg} width={tamanho} height={tamanho} />;
}