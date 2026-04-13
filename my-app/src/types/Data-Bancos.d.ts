declare module '@edusites/bancos-brasil' {
  export function svgBanco(options: {
    nome?: string;
    formato?: string;
    cor?: string;
    fundo?: string;
    tamanho?: number;
  }): string;
}