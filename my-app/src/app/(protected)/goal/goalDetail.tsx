import theme from "@/app/themes/theme";
import Screen from "@/components/Screen";
import { GRADIENTS } from "@/components/CardHome";
import { useGoals } from "@/contexts/goalContext";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSharedValue, withTiming, Easing } from "react-native-reanimated";
import { useEffect } from "react";
import { AnimatedProgressBar } from "@/components/progressBar";
import Button from "@/components/Button";
import { useSaving } from "@/contexts/savingContext";
import { useWallets } from "@/contexts/walletContext"

function goalDetail() {
  const router = useRouter();
  const { goals, deleteGoal } = useGoals();
  const { loadSavings, getSavingsByGoal } = useSaving();
  const { wallets } = useWallets();

  const params = useLocalSearchParams<{
    id: string;
    gradientIndex?: string;
  }>();

  const goal = goals.find((g) => g.id === params.id);

  const gradientIndex = Number(params.gradientIndex ?? 0);
  const gradient = GRADIENTS[gradientIndex % GRADIENTS.length];

  const progress = useSharedValue(0);

  const safeCurrent = Number(goal?.currentAmount ?? 0);
  const safeTarget = Number(goal?.targetAmount ?? 0);

  useEffect(() => {
    if (!goal) return;

    const percent =
      safeTarget > 0
        ? Math.min((safeCurrent / safeTarget) * 100, 100)
        : 0;

    progress.value = withTiming(percent, {
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [goal]);

  useEffect(() => {
    if (goal?.id) {
      loadSavings(goal.id);
    }
  }, [goal?.id]);

  if (!goal) {
    return (
      <Screen style={{ padding: 24, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: theme.colors.textSecondary }}>
          Meta não encontrada
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: theme.colors.primary }}>Voltar</Text>
        </TouchableOpacity>
      </Screen>
    );
  }

  const goalSavings = getSavingsByGoal(goal.id) || [];

  const progressPercent =
    safeTarget > 0
      ? Math.min(Math.round((safeCurrent / safeTarget) * 100), 100)
      : 0;

  const remaining = Math.max(safeTarget - safeCurrent, 0);

  function handleEdit() {
    router.push({
      pathname: "/(protected)/goal/createGoal",
      params: {
        id: goal!.id,
        name: goal!.name,
        targetAmount: String(goal!.targetAmount),
        currentAmount: String(goal!.currentAmount),
        deadline: goal!.deadline,
      },
    });
  }

  function handleDelete() {
    Alert.alert("Deletar meta", "Tem certeza que deseja excluir essa meta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          await deleteGoal(goal!.id);
          router.back();
        },
      },
    ]);
  }

  function handleDeposit() {
    router.push({
      pathname: "/(protected)/savings/createSavings",
      params: {
        goalId: goal!.id,
        goalName: goal!.name,
      },
    });
  }

  return (
    <Screen style={{ padding: 0 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <FontAwesome name="arrow-left" size={16} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>

            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconBtn} onPress={handleEdit}>
                <Ionicons name="pencil-outline" size={18} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconBtn} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={18} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.goalName}>{goal.name}</Text>

            <Text style={styles.goalDeadline}>
              Prazo:{" "}
              {new Date(goal.deadline).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Guardado</Text>
            <Text style={styles.summaryValue}>
              R$ {safeCurrent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={[styles.summaryCard, styles.summaryCardMiddle]}>
            <Text style={styles.summaryLabel}>Meta</Text>
            <Text style={styles.summaryValue}>
              R$ {safeTarget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Faltam</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
              R$ {remaining.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        <View style={styles.barSection}>
          <View style={styles.barHeader}>
            <Text style={styles.barLabel}>Progresso</Text>
            <Text style={styles.barPercent}>{progressPercent}%</Text>
          </View>

          <AnimatedProgressBar
            progress={progressPercent / 100}
            useGradient
            gradientColors={gradient}
            trackColor="rgba(255,255,255,0.08)"
            height={10}
            width="100%"
            animationDuration={1000}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Depósitos</Text>

          {!goalSavings.length ? (
            <Text style={styles.sectionEmpty}>
              Nenhum depósito registrado ainda
            </Text>
          ) : (
            goalSavings.map((saving) => {
              const safeAmount = Number(saving?.amount ?? 0);

              return (
                <View
                  key={saving.id}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <Text style={{color: theme.colors.textSecondary}}>{wallets.filter((w) => w.id === saving.walletId)?.[0]?.name || "Carteira não encontrada"}</Text>
                  <Text style={{ color: theme.colors.secondary }}>
                    + R$ {safeAmount.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.cta}>
          <Button label="Fazer depósito" onPress={handleDeposit} />
        </View>

      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroContent: {
    marginTop: 24,
    gap: 8,
  },
  goalName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
  },
  goalDeadline: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 16,
  },
  progressText: {
    gap: 2,
  },
  progressPercent: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
  },
  progressLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  summaryRow: {
    flexDirection: "row",
    marginHorizontal: 24,
    marginTop: -20,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  summaryCardMiddle: {
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
  },
  summaryLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
  },
  barSection: {
    marginHorizontal: 24,
    marginTop: 24,
    gap: 10,
  },
  barHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  barLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  barPercent: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
  },
  section: {
    marginHorizontal: 24,
    marginTop: 28,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  },
  sectionEmpty: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    paddingVertical: 12,
  },
  cta: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  depositBtn: {
    width: "100%",
    height: 54,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  depositBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default goalDetail;