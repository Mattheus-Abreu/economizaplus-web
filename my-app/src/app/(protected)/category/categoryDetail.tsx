import Dropdown from "@/components/dropdown";
import AppModal, { MODAL_HIDDEN, ModalConfig } from "@/components/modal/modal";
import Screen from "@/components/Screen";
import { useCategory } from "@/contexts/categoryContext";
import { useTransactions } from "@/contexts/transactionContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Dinheiro",
  CREDIT_CARD: "Cartão de crédito",
  DEBIT_CARD: "Cartão de débito",
  PIX: "Pix",
  BANK_TRANSFER: "Transferência",
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function darken(hex: string): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((n >> 16) & 0xff) - 50);
  const g = Math.max(0, ((n >> 8) & 0xff) - 50);
  const b = Math.max(0, (n & 0xff) - 50);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export default function CategoryDetail() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { categories, deleteCategory } = useCategory();
  const { transactions } = useTransactions();
  const [modal, setModal] = useState<ModalConfig>(MODAL_HIDDEN);

  const params = useLocalSearchParams<{
    id: string;
    month?: string;
    year?: string;
    sublabel?: string;
  }>();

  const category = (categories ?? []).find((c) => c.id === params.id);
  const colorStart = category?.color ?? "#7C3AED";
  const colorEnd = darken(colorStart);
  const displayIcon = (category?.icon ?? "tag") as any;

  const filterMonth = params.month !== undefined ? Number(params.month) : null;
  const filterYear = params.year !== undefined ? Number(params.year) : null;
  const isMonthFiltered = filterMonth !== null && filterYear !== null;

  const monthLabel = isMonthFiltered
    ? new Date(filterYear!, filterMonth!).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })
    : null;

  const categoryTransactions = useMemo(() => {
    return (transactions ?? [])
      .filter((t) => {
        if (String(t.categoryId) !== String(params.id)) return false;
        if (isMonthFiltered) {
          const d = new Date(t.transactionDate);
          return d.getMonth() === filterMonth && d.getFullYear() === filterYear;
        }
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime(),
      );
  }, [transactions, params.id, filterMonth, filterYear]);

  const total = categoryTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const count = categoryTransactions.length;
  const average = count > 0 ? total / count : 0;

  function handleEdit() {
    if (category?.type === "default") {
      return setModal({
        visible: true,
        variant: "error",
        title: "Erro",
        description: "Essa categoria não pode ser editada.",
        buttons: [{ label: "Fechar", onPress: () => setModal(MODAL_HIDDEN), variant: "secondary" }],
      });
    }
    router.push({
      pathname: "/(protected)/category/createCategory",
      params: { id: category?.id, name: category?.name, color: category?.color },
    });
  }

  function handleDelete() {
    if (category?.type === "default") {
      return setModal({
        visible: true,
        variant: "error",
        title: "Erro",
        description: "Essa categoria não pode ser excluída.",
        buttons: [{ label: "Fechar", onPress: () => setModal(MODAL_HIDDEN), variant: "secondary" }],
      });
    }
    setModal({
      visible: true,
      variant: "warning",
      title: "Excluir categoria",
      description: "Tem certeza que deseja excluir essa categoria? Essa ação não pode ser desfeita.",
      buttons: [
        { label: "Cancelar", onPress: () => setModal(MODAL_HIDDEN), variant: "secondary" },
        {
          label: "Excluir",
          onPress: async () => {
            await deleteCategory(category?.id!);
            setModal(MODAL_HIDDEN);
            router.back();
          },
          variant: "danger",
        },
      ],
    });
  }

  return (
    <Screen style={{ padding: 0 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* Hero gradient */}
        <LinearGradient
          colors={[colorStart, colorEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Background icon */}
          <View style={styles.bgIconWrap} pointerEvents="none">
            <FontAwesome name={displayIcon} size={180} color="rgba(255,255,255,0.1)" />
          </View>

          {/* Nav row */}
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
              <FontAwesome name="arrow-left" size={16} color="rgba(255,255,255,0.85)" />
            </TouchableOpacity>

            <Dropdown>
              <Dropdown.Trigger style={styles.navBtn}>
                <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
              </Dropdown.Trigger>
              <Dropdown.Content style={styles.menu}>
                <Dropdown.Item onPress={handleEdit}>
                  <Text style={styles.menuItem}>Editar</Text>
                  <Ionicons name="pencil" size={16} color="#111" />
                </Dropdown.Item>
                <Dropdown.Item onPress={handleDelete}>
                  <Text style={[styles.menuItem, styles.destructive]}>Deletar</Text>
                  <Ionicons name="trash-outline" size={16} color="#dc2626" />
                </Dropdown.Item>
              </Dropdown.Content>
            </Dropdown>
          </View>

          {/* Hero text */}
          <View style={styles.heroContent}>
            {params.sublabel && (
              <Text style={styles.heroSublabel}>{params.sublabel}</Text>
            )}
            <Text style={styles.heroName}>{category?.name}</Text>
            {monthLabel && (
              <Text style={styles.heroMonth}>{monthLabel}</Text>
            )}
          </View>
        </LinearGradient>

        {/* Summary strip */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{formatBRL(total)}</Text>
            <Text style={styles.summaryLabel}>Total gasto</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{count}</Text>
            <Text style={styles.summaryLabel}>Compras</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{formatBRL(average)}</Text>
            <Text style={styles.summaryLabel}>Média</Text>
          </View>
        </View>

        {/* Transaction list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registros</Text>

          {count === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={40} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
            </View>
          ) : (
            categoryTransactions.map((t) => (
              <View key={t.id} style={styles.transactionRow}>
                <View style={[styles.transactionDot, { backgroundColor: colorStart }]} />
                <View style={styles.transactionBody}>
                  <View style={styles.transactionTop}>
                    <Text style={styles.transactionDesc} numberOfLines={1}>
                      {t.description || category?.name}
                    </Text>
                    <Text style={[
                      styles.transactionAmount,
                      t.type === "INCOME" && { color: "#22C55E" },
                    ]}>
                      {formatBRL(Number(t.amount))}
                    </Text>
                  </View>
                  <Text style={styles.transactionMeta}>
                    {formatDate(t.transactionDate)}
                    {"  •  "}
                    {PAYMENT_METHOD_LABELS[t.paymentMethod] ?? t.paymentMethod}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>

      <AppModal
        visible={modal.visible}
        onClose={() => setModal(MODAL_HIDDEN)}
        variant={modal.variant}
        title={modal.title}
        description={modal.description}
        buttons={modal.buttons}
      />
    </Screen>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    headerGradient: {
      paddingTop: 56,
      paddingBottom: 40,
      paddingHorizontal: 24,
      overflow: "hidden",
    },
    bgIconWrap: {
      position: "absolute",
      right: -30,
      bottom: -20,
    },
    navRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    navBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: "rgba(0,0,0,0.18)",
      borderWidth: 0.5,
      borderColor: "rgba(255,255,255,0.15)",
      alignItems: "center",
      justifyContent: "center",
    },
    heroContent: {
      marginTop: 24,
      gap: 4,
    },
    heroSublabel: {
      fontSize: 13,
      color: "rgba(255,255,255,0.75)",
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    heroName: {
      fontSize: 30,
      fontWeight: "800",
      color: "#fff",
      marginTop: 4,
    },
    heroMonth: {
      fontSize: 14,
      color: "rgba(255,255,255,0.7)",
      textTransform: "capitalize",
    },

    summaryRow: {
      flexDirection: "row",
      marginHorizontal: 20,
      marginTop: -20,
      backgroundColor: theme.colors.surface,
      borderRadius: 18,
      borderWidth: 0.5,
      borderColor: "rgba(255,255,255,0.08)",
      overflow: "hidden",
    },
    summaryItem: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 16,
      gap: 4,
    },
    summaryDivider: {
      width: 0.5,
      backgroundColor: "rgba(255,255,255,0.08)",
      alignSelf: "stretch",
      marginVertical: 12,
    },
    summaryValue: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.text,
    },
    summaryLabel: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    section: {
      marginTop: 28,
      paddingHorizontal: 20,
      gap: 4,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 12,
    },

    emptyState: {
      alignItems: "center",
      paddingVertical: 40,
      gap: 12,
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },

    transactionRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      paddingVertical: 14,
      borderBottomWidth: 0.5,
      borderColor: "rgba(255,255,255,0.07)",
    },
    transactionDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginTop: 6,
    },
    transactionBody: {
      flex: 1,
      gap: 4,
    },
    transactionTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
    },
    transactionDesc: {
      flex: 1,
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.text,
    },
    transactionAmount: {
      fontSize: 15,
      fontWeight: "700",
      color: "#F43F5E",
    },
    transactionMeta: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },

    menu: {
      backgroundColor: "#FFFFFF",
      borderRadius: 14,
      paddingVertical: 6,
    },
    menuItem: {
      fontSize: 15,
      color: "#111",
      fontWeight: "500",
    },
    destructive: {
      color: "#FF4D4D",
    },
  });
