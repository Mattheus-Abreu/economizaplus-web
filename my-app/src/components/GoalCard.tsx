import Dropdown from "@/components/dropdown";
import { AnimatedProgressBar } from "@/components/progressBar";
import { useGoals } from "@/contexts/goalContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import Goal from "@/types/goal";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Easing, useSharedValue, withTiming } from "react-native-reanimated";
import AppModal, { MODAL_HIDDEN, ModalConfig } from "./modal/modal";

type Props = {
  item: Goal;
  gradient?: [string, string];
  gradientIndex?: number;
};

function GoalCard({ item, gradient, gradientIndex }: Props) {
  const router = useRouter();
  const { deleteGoal } = useGoals();
  const [modal, setModal] = useState<ModalConfig>(MODAL_HIDDEN);
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const safeCurrent = Number(item.currentAmount ?? 0);
  const safeTarget = Number(item.targetAmount ?? 1);
  const percentage = Math.min(safeCurrent / safeTarget, 1);
  const percentageInt = Math.round(percentage * 100);
  const remaining = Math.max(safeTarget - safeCurrent, 0);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(percentage, {
      duration: 1200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [item.currentAmount, item.targetAmount]);

  function formatBRL(value: number): string {
    if (isNaN(value)) return "–";
    // Abreviação para valores grandes
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1).replace(".", ",")}k`;
    }
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    });
  }

  function formatDeadline(deadline: string): string {
    return new Date(deadline).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function handleEdit() {
    router.push({
      pathname: "/(protected)/goal/createGoal",
      params: {
        id: item.id,
        name: item.name,
        targetAmount: item.targetAmount,
        currentAmount: item.currentAmount,
        deadline: item.deadline,
      },
    });
  }

  function handleDelete() {
    setModal({
      visible: true,
      variant: "warning",
      title: "Excluir meta",
      description: "Tem certeza que deseja excluir essa meta? Esta ação não pode ser desfeita.",
      buttons: [
        {
          label: "Cancelar",
          onPress: () => setModal(MODAL_HIDDEN),
          variant: "secondary",
        },
        {
          label: "Excluir",
          onPress: async () => {
            await deleteGoal(item.id);
            setModal(MODAL_HIDDEN);
          },
          variant: "danger",
        },
      ],
    });
  }

  const gradientColors: [string, string] = gradient ?? ["#7C3AED", "#A855F7"];
  const isComplete = percentageInt >= 100;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() =>
        router.push({
          pathname: "/goal/goalDetail",
          params: {
            id: item.id,
            gradientIndex: (gradientIndex ?? 0).toString(),
          },
        })
      }
    >
      <View style={styles.card}>
        {/* Header com gradiente */}
        <LinearGradient
          colors={[gradientColors[1], gradientColors[0]]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.cardHeader}
        >
          {/* Círculo decorativo de fundo */}
          <View style={styles.bgCircle} />

          <View style={styles.headerRow}>
            {/* Percentual em destaque */}
            <View style={styles.percentBadge}>
              <Text style={styles.percentText}>{percentageInt}%</Text>
            </View>

            {/* Menu de ações */}
            <Dropdown>
              <Dropdown.Trigger style={styles.trigger}>
                <Ionicons
                  name="ellipsis-horizontal"
                  size={18}
                  color="rgba(255,255,255,0.8)"
                />
              </Dropdown.Trigger>

              <Dropdown.Content style={styles.menu}>
                <Dropdown.Item onPress={handleEdit}>
                  <Text style={styles.itemText}>Editar</Text>
                  <Ionicons name="pencil" size={16} color="#111" />
                </Dropdown.Item>
                <Dropdown.Item onPress={handleDelete}>
                  <Text style={[styles.itemText, styles.destructive]}>Deletar</Text>
                  <Ionicons name="trash-outline" size={16} color="#dc2626" />
                </Dropdown.Item>
              </Dropdown.Content>
            </Dropdown>
          </View>

          {/* Nome da meta e prazo */}
          <View style={styles.heroContent}>
            <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
            <View style={styles.deadlineRow}>
              <Ionicons name="calendar-outline" size={11} color="rgba(255,255,255,0.6)" />
              <Text style={styles.deadline}>{formatDeadline(item.deadline)}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Corpo do card */}
        <View style={styles.cardBody}>
          {/* Barra de progresso */}
          <View style={styles.progressSection}>
            <AnimatedProgressBar
              progress={percentage}
              useGradient
              gradientColors={gradientColors}
              trackColor={theme.colors.glass + "40"}
              height={6}
              width="100%"
              animationDuration={1200}
            />
          </View>

          {/* Info row: guardado / falta / meta */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Guardado</Text>
              <Text style={styles.infoValue}>{formatBRL(safeCurrent)}</Text>
            </View>

            <View style={[styles.infoItem, styles.infoItemCenter]}>
              <Text style={styles.infoLabel}>Falta</Text>
              <Text style={[styles.infoValue, { color: gradientColors[0] }]}>
                {isComplete ? "–" : formatBRL(remaining)}
              </Text>
            </View>

            <View style={[styles.infoItem, styles.infoItemRight]}>
              <Text style={styles.infoLabel}>Meta</Text>
              <Text style={styles.infoValue}>{formatBRL(safeTarget)}</Text>
            </View>
          </View>

          {/* Badge de meta concluída */}
          {isComplete && (
            <View style={styles.completeBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
              <Text style={styles.completeText}>Meta concluída!</Text>
            </View>
          )}
        </View>
      </View>

      <AppModal
        visible={modal.visible}
        onClose={() => setModal(MODAL_HIDDEN)}
        variant={modal.variant}
        title={modal.title}
        description={modal.description}
        buttons={modal.buttons}
      />
    </TouchableOpacity>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    card: {
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      overflow: "hidden",
      borderWidth: 0.5,
      borderColor: theme.colors.glass,
    },

    // Header com gradiente
    cardHeader: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 20,
      position: "relative",
      overflow: "hidden",
    },
    bgCircle: {
      position: "absolute",
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: "rgba(255,255,255,0.06)",
      right: -30,
      top: -30,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
    },
    percentBadge: {
      backgroundColor: "rgba(0,0,0,0.2)",
      borderRadius: 99,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderWidth: 0.5,
      borderColor: "rgba(255,255,255,0.2)",
    },
    percentText: {
      fontSize: 13,
      fontWeight: "700",
      color: "#fff",
    },
    trigger: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: "rgba(0,0,0,0.2)",
      borderWidth: 0.5,
      borderColor: "rgba(255,255,255,0.15)",
      justifyContent: "center",
      alignItems: "center",
    },
    heroContent: {
      gap: 4,
    },
    title: {
      fontSize: 20,
      fontWeight: "800",
      color: "#fff",
      letterSpacing: -0.3,
    },
    deadlineRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    deadline: {
      fontSize: 12,
      color: "rgba(255,255,255,0.6)",
    },

    // Corpo
    cardBody: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 16,
      gap: 14,
    },
    progressSection: {
      marginTop: -6,
    },
    infoRow: {
      flexDirection: "row",
    },
    infoItem: {
      flex: 1,
      gap: 3,
    },
    infoItemCenter: {
      alignItems: "center",
      borderLeftWidth: 0.5,
      borderRightWidth: 0.5,
      borderColor: theme.colors.glass,
    },
    infoItemRight: {
      alignItems: "flex-end",
    },
    infoLabel: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.text,
    },

    // Badge concluído
    completeBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "rgba(34,197,94,0.1)",
      borderWidth: 0.5,
      borderColor: "rgba(34,197,94,0.3)",
      borderRadius: 99,
      paddingHorizontal: 12,
      paddingVertical: 6,
      alignSelf: "flex-start",
    },
    completeText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#22C55E",
    },

    menu: {
      backgroundColor: "#FFFFFF",
      borderRadius: 14,
      paddingVertical: 6,
    },
    itemText: {
      fontSize: 15,
      color: "#111",
      fontWeight: "500",
    },
    destructive: {
      color: "#dc2626",
    },
  });

export default GoalCard;