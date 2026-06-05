import { useAppTheme } from "@/hooks/useAppTheme";
import Goal from "@/types/goal";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export const GRADIENTS: [string, string][] = [
  ["#F43F5E", "#FB7185"],
  ["#7C3AED", "#A78BFA"],
  ["#22C55E", "#4ADE80"],
  ["#F97316", "#FDBA74"],
  ["#0EA5E9", "#38BDF8"],
  ["#EC4899", "#F9A8D4"],
];

function formatAmount(value: number): string {
  if (isNaN(value)) return "0";
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDeadline(dateStr: string): string | null {
  if (!dateStr) return null;
  const deadline = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "Prazo encerrado";
  if (diffDays === 0) return "Vence hoje";
  if (diffDays === 1) return "Vence amanhã";
  if (diffDays < 30) return `${diffDays} dias restantes`;
  const months = Math.floor(diffDays / 30);
  return `${months} ${months === 1 ? "mês" : "meses"} restante${months === 1 ? "" : "s"}`;
}

type Props = {
  item: Goal;
  fontLoaded: boolean;
  gradientIndex?: number;
};

const CardHome = ({ item, fontLoaded, gradientIndex = 0 }: Props) => {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const currentAmount = Number(item.currentAmount);
  const targetAmount = Number(item.targetAmount);
  const progressPercent =
    targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;
  const deadlineText = formatDeadline(item.deadline);
  const gradient = GRADIENTS[gradientIndex % GRADIENTS.length];

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(protected)/goal/goalDetail",
            params: { id: item.id, gradientIndex: gradientIndex.toString() },
          })
        }
        style={({ pressed }) => [
          styles.pressable,
          { opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
      >
        {/* Top row */}
        <View style={styles.topRow}>
          <Text style={styles.label}>META</Text>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.name}
          </Text>
        </View>

        {/* Bottom row */}
        <View style={styles.bottomBlock}>
          <View style={styles.amountsRow}>
            <Text style={styles.currentAmount}>
              R$ {formatAmount(currentAmount)}
            </Text>
            <Text style={styles.targetAmount}>
              de R$ {formatAmount(targetAmount)}
            </Text>
          </View>

          <View style={styles.progressBarBg}>
            <View
              style={[styles.progressBarFill, { width: `${progressPercent}%` as any }]}
            />
          </View>

          {deadlineText && (
            <Text style={styles.deadline}>{deadlineText}</Text>
          )}
        </View>
      </Pressable>
    </View>
  );
};

export default CardHome;

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    card: {
      width: "100%",
      borderRadius: 24,
      overflow: "hidden",
      padding: 20,
    },
    pressable: {
      gap: 16,
    },
    topRow: {
      gap: 4,
    },
    label: {
      fontSize: 10,
      fontWeight: "700",
      color: "rgba(255,255,255,0.6)",
      letterSpacing: 1.5,
    },
    cardTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: "#fff",
      lineHeight: 28,
    },
    bottomBlock: {
      gap: 8,
    },
    amountsRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 6,
    },
    currentAmount: {
      fontSize: 18,
      fontWeight: "700",
      color: "#fff",
    },
    targetAmount: {
      fontSize: 13,
      fontWeight: "500",
      color: "rgba(255,255,255,0.65)",
    },
    progressBarBg: {
      height: 4,
      backgroundColor: "rgba(255,255,255,0.25)",
      borderRadius: 99,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: "#fff",
      borderRadius: 99,
    },
    deadline: {
      fontSize: 12,
      color: "rgba(255,255,255,0.6)",
      fontWeight: "500",
    },
  });
