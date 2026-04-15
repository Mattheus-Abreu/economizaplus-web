import type { ReactNode } from "react";
import type { SharedValue } from "react-native-reanimated";

interface ISemiCircularProgress {
  progress: SharedValue<number>; // 0 → 100

  readonly size?: number;
  readonly strokeWidth?: number;
  readonly useGradient?: boolean;
  readonly gradientColors?: string[];
  readonly progressColor?: string;
  readonly trackColor?: string;
  readonly backgroundColor?: string;

  

  readonly renderCenter?: () => ReactNode;
}

export type { ISemiCircularProgress };
