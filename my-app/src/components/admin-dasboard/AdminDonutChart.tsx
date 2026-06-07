import { useTheme } from "@/components/theme-switch/hooks";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Text as SvgText } from "react-native-svg";

export type DonutSlice = {
  label: string;
  value: number;     
  color: string;
};

type AdminDonutChartProps = {
  slices: DonutSlice[];
  centerLabel?: string;
  centerSublabel?: string;
  size?: number;
  strokeWidth?: number;
};

export function AdminDonutChart({
  slices,
  centerLabel,
  centerSublabel,
  size = 88,
  strokeWidth = 14,
}: AdminDonutChartProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const total = slices.reduce((s, sl) => s + sl.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  // Calcula os dasharray/offset para cada fatia
  let accumulated = 0;
  const sliceData = slices.map((sl) => {
    const pct = total > 0 ? sl.value / total : 0;
    const dash = pct * circumference;
    const gap = circumference - dash;
    // Rotaciona: começa em -90° (topo), offset negativo acumula
    const offset = -(accumulated * circumference) + circumference / 4;
    accumulated += pct;
    return { ...sl, pct, dash, gap, offset };
  });

  return (
    <View style={styles.card}>
      <View style={styles.inner}>
        {/* Donut SVG */}
        <View style={{ width: size, height: size }}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Trilha */}
            <Circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={colors.glass}
              strokeWidth={strokeWidth}
            />
            {/* Fatias */}
            {sliceData.map((sl, i) => (
              <Circle
                key={i}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={sl.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${sl.dash} ${sl.gap}`}
                strokeDashoffset={sl.offset}
              />
            ))}
            {/* Centro */}
            {centerLabel && (
              <SvgText
                x={cx}
                y={cy + (centerSublabel ? -5 : 5)}
                textAnchor="middle"
                fontSize={size > 80 ? 13 : 11}
                fontWeight="700"
                fill={colors.text + "80"}
              >
                {centerLabel}
              </SvgText>
            )}
            {centerSublabel && (
              <SvgText
                x={cx}
                y={cy + 12}
                textAnchor="middle"
                fontSize={9}
                fill={colors.textSecondary}
              >
                {centerSublabel}
              </SvgText>
            )}
          </Svg>
        </View>

        {/* Legenda */}
        <View style={styles.legend}>
          {sliceData.map((sl, i) => (
            <View key={i} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: sl.color }]} />
              <Text style={styles.legendLabel} numberOfLines={1}>
                {sl.label}
              </Text>
              <Text style={styles.legendPct}>
                {Math.round(sl.pct * 100)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
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
    inner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    legend: {
      flex: 1,
      gap: 8,
    },
    legendRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      flexShrink: 0,
    },
    legendLabel: {
      flex: 1,
      fontSize: 12,
      color: colors.textSecondary,
    },
    legendPct: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.text,
    },
  });