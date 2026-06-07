import { useTheme } from "@/components/theme-switch/hooks";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

type SparkPoint = number;

type MetricCardProps = {
  label: string;
  value: string;
  variation?: number;
  variationLabel?: string;
  spark?: SparkPoint[];
  sparkColor?: string;
  accentColor?: string;
};

const DEFAULT_SPARK: SparkPoint[] = [30, 45, 38, 55, 70, 82, 100];

export function MetricCard({
  label,
  value,
  variation,
  variationLabel = "vs mês ant.",
  spark = DEFAULT_SPARK,
  sparkColor = "#7C3AED",
  accentColor,
}: MetricCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const hasVariation = variation !== undefined;
  const isPositive = (variation ?? 0) >= 0;
  const variationColor = isPositive ? "#22C55E" : "#F43F5E";
  const variationIcon: keyof typeof Ionicons.glyphMap = isPositive
    ? "arrow-up"
    : "arrow-down";
  const variationText = hasVariation
    ? `${isPositive ? "+" : ""}${variation}%`
    : null;

  const color = accentColor ?? sparkColor;

  return (
    <View style={[styles.card, { borderColor: `${color}18` }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        {value}
      </Text>

      {hasVariation && (
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: `${variationColor}18`,
                borderColor: `${variationColor}30`,
              },
            ]}
          >
            <Ionicons name={variationIcon} size={10} color={variationColor} />
            <Text style={[styles.badgeText, { color: variationColor }]}>
              {variationText}
            </Text>
          </View>
          {variationLabel ? (
            <Text style={styles.variationLabel}>{variationLabel}</Text>
          ) : null}
        </View>
      )}

      <View style={styles.sparkRow}>
        {spark.map((point, i) => {
          const isLast = i === spark.length - 1;
          const opacity = 0.25 + (i / (spark.length - 1)) * 0.75;
          return (
            <View
              key={i}
              style={[
                styles.sparkBar,
                {
                  height: `${Math.max(point, 8)}%`,
                  backgroundColor: isLast ? color : `${color}`,
                  opacity: isLast ? 1 : opacity,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

// ── Variante com gradiente para destaque ──────────────────────────────────────
type MetricCardGradientProps = MetricCardProps & {
  gradientColors: [string, string];
};

export function MetricCardGradient({
  label,
  value,
  variation,
  variationLabel,
  gradientColors,
}: MetricCardGradientProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const hasVariation = variation !== undefined;
  const isPositive = (variation ?? 0) >= 0;
  const variationColor = isPositive ? "rgba(255,255,255,0.9)" : "#FECACA";
  const variationIcon: keyof typeof Ionicons.glyphMap = isPositive
    ? "arrow-up"
    : "arrow-down";
  const variationText = hasVariation
    ? `${isPositive ? "+" : ""}${variation}%`
    : null;

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <Text style={[styles.label, { color: "rgba(255,255,255,0.7)" }]}>
        {label}
      </Text>
      <Text
        style={[styles.value, { color: "#fff" }]}
      >
        {value}
      </Text>
      {hasVariation && (
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: "rgba(255,255,255,0.2)",
                borderColor: "rgba(255,255,255,0.3)",
              },
            ]}
          >
            <Ionicons name={variationIcon} size={10} color={variationColor} />
            <Text style={[styles.badgeText, { color: variationColor }]}>
              {variationText}
            </Text>
          </View>
          {variationLabel ? (
            <Text
              style={[
                styles.variationLabel,
                { color: "rgba(255,255,255,0.5)" },
              ]}
            >
              {variationLabel}
            </Text>
          ) : null}
        </View>
      )}
    </LinearGradient>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    card: {
      width: 190,
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 16,
      borderWidth: 0.5,
      borderColor: colors.glass,
      gap: 4,
      minHeight: 130,
    },
    label: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    value: {
      fontSize: 26,
      fontWeight: "700",
      color: colors.text,
      lineHeight: 32,
    },
    badgeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 2,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 20,
      borderWidth: 0.5,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: "600",
    },
    variationLabel: {
      fontSize: 10,
      color: colors.textSecondary,
    },
    sparkRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 2,
      height: 24,
      marginTop: "auto"
    },
    sparkBar: {
      flex: 1,
      borderRadius: 3,
      minHeight: 3,
    },
  });