import { useTheme } from "@/components/theme-switch/hooks";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type BarChartDataPoint = {
  label: string;
  value: number;
  highlight?: boolean;
};

type AdminBarChartProps = {
  data: BarChartDataPoint[];
  color?: string;
  /** Cor base do gradiente (topo). Padrão: color */
  gradientColorTop?: string;
  /** Cor escura do gradiente (base). Padrão: versão mais escura de color */
  gradientColorBottom?: string;
  maxBarHeight?: number;
  onBarPress?: (point: BarChartDataPoint, index: number) => void;
  footerLabel?: string;
  footerBadge?: string;
  footerBadgeColor?: string;
  selectedIndex?: number;
};

/** Escurece um hex em ~40 pontos por canal */
function darken(hex: string): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((n >> 16) & 0xff) - 40);
  const g = Math.max(0, ((n >> 8) & 0xff) - 40);
  const b = Math.max(0, (n & 0xff) - 40);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export function AdminBarChart({
  data,
  color = "#7C3AED",
  gradientColorTop,
  gradientColorBottom,
  maxBarHeight = 60,
  onBarPress,
  footerLabel,
  footerBadge,
  footerBadgeColor = "#22C55E",
  selectedIndex,
}: AdminBarChartProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const max = Math.max(...data.map((d) => d.value), 1);

  // Cores do gradiente da barra selecionada
  const gradTop = gradientColorTop ?? color;
  const gradBottom = gradientColorBottom ?? darken(color);

  // Cores da barra não selecionada (mais suave)
  const inactiveTop = `${color}55`;
  const inactiveBottom = `${color}22`;

  return (
    <View style={styles.card}>
      {/* Barras */}
      <View style={[styles.barsRow, { height: maxBarHeight + 20 }]}>
        {data.map((point, i) => {
          const barH = Math.max((point.value / max) * maxBarHeight, 4);
          const isSelected =
            selectedIndex !== undefined
              ? i === selectedIndex
              : (point.highlight ?? false);

          return (
            <TouchableOpacity
              key={i}
              style={styles.barCol}
              onPress={() => onBarPress?.(point, i)}
              activeOpacity={0.7}
              disabled={!onBarPress}
            >
              <Text
                style={[
                  styles.barValue,
                  { opacity: isSelected ? 1 : 0, color },
                ]}
                numberOfLines={1}
              >
                {point.value}
              </Text>

              <View style={[styles.barTrack, { height: maxBarHeight }]}>
                <LinearGradient
                  colors={
                    isSelected
                      ? [gradTop, gradBottom]
                      : [inactiveTop, inactiveBottom]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={[styles.barFill, { height: barH }]}
                />
              </View>

              <Text
                style={[
                  styles.barLabel,
                  isSelected && { color, fontWeight: "700" },
                ]}
              >
                {point.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Rodapé opcional */}
      {(footerLabel || footerBadge) && (
        <View style={styles.footer}>
          {footerLabel ? (
            <Text style={styles.footerLabel}>{footerLabel}</Text>
          ) : null}
          {footerBadge ? (
            <View
              style={[
                styles.footerBadge,
                {
                  backgroundColor: `${footerBadgeColor}18`,
                  borderColor: `${footerBadgeColor}30`,
                },
              ]}
            >
              <Text style={[styles.footerBadgeText, { color: footerBadgeColor }]}>
                {footerBadge}
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 16,
      borderWidth: 0.5,
      borderColor: colors.glass,
    },
    barsRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 5,
    },
    barCol: {
      flex: 1,
      alignItems: "center",
      gap: 4,
    },
    barLabel: {
      fontSize: 10,
      color: colors.textSecondary,
    },
    barValue: {
      fontSize: 9,
      fontWeight: "700",
      textAlign: "center",
    },
    barTrack: {
      width: "100%",
      justifyContent: "flex-end",
      alignItems: "center",
    },
    barFill: {
      width: "100%",
      borderRadius: 5,
      minHeight: 4,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 12,
      paddingTop: 10,
      borderTopWidth: 0.5,
      borderTopColor: "rgba(255,255,255,0.06)",
    },
    footerLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      flex: 1,
    },
    footerBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      borderWidth: 0.5,
    },
    footerBadgeText: {
      fontSize: 11,
      fontWeight: "600",
    },
  });