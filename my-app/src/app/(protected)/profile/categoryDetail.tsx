import Screen from "@/components/Screen";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useCategory } from "@/contexts/categoryContext";
import { useTransactions } from "@/contexts/transactionContext";
import { MOCK_TRANSACTIONS } from "@/mocks/profileMocks";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const MOCK_CATEGORY_TRANSACTIONS = MOCK_TRANSACTIONS.filter((t) => t.categoryId === "cat-1");

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

export default function CategoryDetail() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { transactions } = useTransactions();
  const { categories } = useCategory();

  const params = useLocalSearchParams<{
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    categoryColorEnd: string;
    categoryIcon: string;
    month: string;
    year: string;
  }>();

  const now = new Date();
  const filterMonth = params.month ? Number(params.month) : now.getMonth();
  const filterYear = params.year ? Number(params.year) : now.getFullYear();

  const category = categories.find((c) => c.id === params.categoryId);
  const displayName = category?.name ?? params.categoryName ?? "Categoria";
  const displayIcon = (category?.icon ?? params.categoryIcon ?? "tag") as any;
  const gradientStart = category?.color ?? params.categoryColor ?? "#7C3AED";
  const gradientEnd = params.categoryColorEnd ?? darken(gradientStart);

  const realTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (String(t.categoryId) !== String(params.categoryId)) return false;
      const d = new Date(t.transactionDate);
      return d.getMonth() === filterMonth && d.getFullYear() === filterYear;
    });
  }, [transactions, params.categoryId, filterMonth, filterYear]);

  const categoryTransactions: any[] = realTransactions.length > 0
    ? realTransactions
    : MOCK_CATEGORY_TRANSACTIONS;

  const total = categoryTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const count = categoryTransactions.length;
  const average = count > 0 ? total / count : 0;

  const monthLabel = new Date(filterYear, filterMonth).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <Screen style={{ padding: 0 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* Header gradient */}
        <LinearGradient
          colors={[gradientStart, gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Background icon */}
          <View style={styles.bgIconWrap} pointerEvents="none">
            <FontAwesome name={displayIcon} size={180} color="rgba(255,255,255,0.1)" />
          </View>

          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={16} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>

          <View style={styles.heroContent}>
            <Text style={styles.heroCategory}>Categoria + gasta</Text>
            <Text style={styles.heroName}>{displayName}</Text>
            <Text style={styles.heroMonth}>{monthLabel}</Text>
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
              <Text style={styles.emptyText}>Nenhuma compra encontrada nesse mês</Text>
            </View>
          ) : (
            categoryTransactions
              .slice()
              .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
              .map((t) => (
                <View key={t.id} style={styles.transactionRow}>
                  <View style={[styles.transactionDot, { backgroundColor: gradientStart }]} />
                  <View style={styles.transactionBody}>
                    <View style={styles.transactionTop}>
                      <Text style={styles.transactionDesc} numberOfLines={1}>
                        {t.description || displayName}
                      </Text>
                      <Text style={styles.transactionAmount}>{formatBRL(Number(t.amount))}</Text>
                    </View>
                    <View style={styles.transactionBottom}>
                      <Text style={styles.transactionMeta}>
                        {formatDate(t.transactionDate)}
                        {"  •  "}
                        {PAYMENT_METHOD_LABELS[t.paymentMethod] ?? t.paymentMethod}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
          )}
        </View>

      </ScrollView>
    </Screen>
  );
}

function darken(hex: string): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((n >> 16) & 0xff) - 40);
  const g = Math.max(0, ((n >> 8) & 0xff) - 40);
  const b = Math.max(0, (n & 0xff) - 40);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
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
    opacity: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroContent: {
    marginTop: 24,
    gap: 4,
  },
  heroCategory: {
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

  // Summary
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

  // Section
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

  // Empty state
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

  // Transaction row
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
  transactionBottom: {
    flexDirection: "row",
    gap: 8,
  },
  transactionMeta: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});
