import { useEffect, useMemo } from "react";
import { View } from "react-native";
import { SvgXml } from "react-native-svg";
import { svgBanco } from "../../node_modules/@edusites/bancos-brasil/src/core.js";

type BancoIconProps = {
  nome: string;
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
  tamanho = 60,
}: BancoIconProps) {
  const svg = useMemo(() => {
    if (!nome) return "";
    return svgBanco({ nome, formato, cor, fundo, tamanho }) ?? "";
  }, [nome, formato, cor, fundo, tamanho]);

  if (!svg) return null;

  return (
    <View>
      <SvgXml xml={svg} width={tamanho} height={tamanho} />
    </View>
  );
}

