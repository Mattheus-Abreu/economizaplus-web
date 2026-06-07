import { BancoNome, svgBanco } from "@edusites/bancos-brasil";
import { SvgFromXml } from "react-native-svg";

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

  return (
    <SvgFromXml xml={svg} width={tamanho} height={tamanho} />
  );
}

