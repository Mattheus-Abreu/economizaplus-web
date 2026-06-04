import theme from "@/app/themes/theme";
import Screen from "@/components/Screen";
import { useCategory } from "@/contexts/categoryContext";
import { useTransactions } from "@/contexts/transactionContext";
import { MOCK_CATEGORIES, MOCK_MONTHLY_TOTALS, MOCK_TRANSACTIONS } from "@/mocks/profileMocks";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  ScrollView as NativeScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Dinheiro",
  CREDIT_CARD: "Crédito",
  DEBIT_CARD: "Débito",
  PIX: "Pix",
  BANK_TRANSFER: "Transferência",
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

const BAR_MAX_H = 72;
const BAR_ITEM_WIDTH = 52;
const BAR_GAP = 6;
const chartMax = Math.max(...MOCK_MONTHLY_TOTALS.map((m) => m.total));

export default function MonthDetail() {
  const router = useRouter();
  const { transactions } = useTransactions();
  const { categories } = useCategory();

  const params = useLocalSearchParams<{ month: string; year: string }>();
  const now = new Date();

  const [selMonth, setSelMonth] = useState(params.month ? Number(params.month) : now.getMonth());
  const [selYear, setSelYear]   = useState(params.year  ? Number(params.year)  : now.getFullYear());

  // Chart scroll centering
  const chartScrollRef = useRef<NativeScrollView>(null);
  const [chartWidth, setChartWidth] = useState(0);

  // Month label transition
  const isFirstRender = useRef(true);
  const directionRef = useRef<1 | -1>(1);
  const labelX = useRef(new Animated.Value(0)).current;
  const labelOpacity = useRef(new Animated.Value(1)).current;

  const selectedChartIdx = MOCK_MONTHLY_TOTALS.findIndex(
    (m) => m.month === selMonth && m.year === selYear
  );

  useEffect(() => {
    if (chartWidth === 0 || selectedChartIdx < 0) return;
    const x = selectedChartIdx * (BAR_ITEM_WIDTH + BAR_GAP);
    chartScrollRef.current?.scrollTo({ x, animated: true });
  }, [selectedChartIdx, chartWidth]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    labelX.setValue(directionRef.current * 22);
    labelOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(labelX, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 280 }),
      Animated.timing(labelOpacity, { toValue: 1, duration: 160, useNativeDriver: true }),
    ]).start();
  }, [selMonth, selYear]);

  function goToPrev() {
    directionRef.current = -1;
    const d = new Date(selYear, selMonth - 1);
    setSelMonth(d.getMonth());
    setSelYear(d.getFullYear());
  }

  function goToNext() {
    const d = new Date(selYear, selMonth + 1);
    const future = d > now;
    if (!future) {
      directionRef.current = 1;
      setSelMonth(d.getMonth());
      setSelYear(d.getFullYear());
    }
  }

  const isAtFuture = new Date(selYear, selMonth + 1) > now;

  const monthLabel = new Date(selYear, selMonth).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const allCategories = (categories && categories.length > 0) ? categories : MOCK_CATEGORIES;

  const rawTransactions: any[] = useMemo(() => {
    const real = (transactions ?? []).filter((t) => {
      if (t.type !== "EXPENSE") return false;
      const d = new Date(t.transactionDate);
      return d.getMonth() === selMonth && d.getFullYear() === selYear;
    });
    if (real.length > 0) return real;
    if (selMonth === 4 && selYear === 2026) return MOCK_TRANSACTIONS as any[];
    return [];
  }, [transactions, selMonth, selYear]);

  const total  = rawTransactions.reduce((s, t) => s + Number(t.amount), 0);
  const count  = rawTransactions.length;

  const byCategory = useMemo(() => {
    const map = new Map<string, { total: number; count: number; category: typeof allCategories[0] | undefined }>();
    for (const t of rawTransactions) {
      const key = String(t.categoryId ?? "__none__");
      const cat = allCategories.find((c) => String(c.id) === key);
      const entry = map.get(key);
      if (entry) { entry.total += Number(t.amount); entry.count += 1; }
      else map.set(key, { total: Number(t.amount), count: 1, category: cat });
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [rawTransactions, allCategories]);

  const sorted = useMemo(
    () => rawTransactions.slice().sort((a, b) =>
      new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
    ),
    [rawTransactions]
  );

  function getCategoryColor(categoryId?: number | string) {
    return allCategories.find((c) => String(c.id) === String(categoryId))?.color ?? "#94A3B8";
  }
  function getCategoryName(categoryId?: number | string) {
    return allCategories.find((c) => String(c.id) === String(categoryId))?.name ?? "Sem categoria";
  }

  return (
    <Screen style={{ padding: 0 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* ── Header gradient ── */}
        <LinearGradient
          colors={["#4C1D95", "#7C3AED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.bgIconWrap} pointerEvents="none">
            <Ionicons name="wallet-outline" size={180} color="rgba(255,255,255,0.08)" />
          </View>

          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={16} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>

          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>Meus Gastos</Text>

            {/* Month navigator */}
            <View style={styles.monthNav}>
              <TouchableOpacity style={styles.navArrow} onPress={goToPrev}>
                <FontAwesome name="chevron-left" size={14} color="rgba(255,255,255,0.85)" />
              </TouchableOpacity>
              <View style={styles.heroNameWrap}>
                <Animated.Text
                  style={[
                    styles.heroName,
                    { transform: [{ translateX: labelX }], opacity: labelOpacity },
                  ]}
                  numberOfLines={1}
                >
                  {monthLabel}
                </Animated.Text>
              </View>
              <TouchableOpacity
                style={[styles.navArrow, isAtFuture && styles.navArrowDisabled]}
                onPress={goToNext}
                disabled={isAtFuture}
              >
                <FontAwesome name="chevron-right" size={14} color={isAtFuture ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.85)"} />
              </TouchableOpacity>
            </View>

            <Text style={styles.heroTotal}>{formatBRL(total)}</Text>
          </View>
        </LinearGradient>

        {/* ── Summary strip ── */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{formatBRL(total)}</Text>
            <Text style={styles.summaryLabel}>Total gasto</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{count}</Text>
            <Text style={styles.summaryLabel}>Transações</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{byCategory.length}</Text>
            <Text style={styles.summaryLabel}>Categorias</Text>
          </View>
        </View>

        {/* ── Bar chart: histórico ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico</Text>
          <NativeScrollView
            ref={chartScrollRef}
            horizontal
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
            contentContainerStyle={[
              styles.chartWrap,
              {
                paddingHorizontal: chartWidth > 0
                  ? (chartWidth - BAR_ITEM_WIDTH) / 2
                  : 0,
              },
            ]}
          >
            {MOCK_MONTHLY_TOTALS.map((m, i) => {
              const isSelected = m.month === selMonth && m.year === selYear;
              const barH = Math.max(6, (m.total / chartMax) * BAR_MAX_H);
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.chartCol, { width: BAR_ITEM_WIDTH }]}
                  onPress={() => {
                    directionRef.current = i > selectedChartIdx ? 1 : -1;
                    setSelMonth(m.month);
                    setSelYear(m.year);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chartValLabel, { opacity: isSelected ? 1 : 0 }]}>
                    {formatBRL(m.total)}
                  </Text>
                  <View style={[styles.chartBarWrap, { height: BAR_MAX_H }]}>
                    <LinearGradient
                      colors={isSelected ? ["#A855F7", "#7C3AED"] : ["rgba(255,255,255,0.14)", "rgba(255,255,255,0.07)"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={[styles.chartBar, { height: barH }]}
                    />
                  </View>
                  <Text style={[styles.chartMonthLabel, isSelected && styles.chartMonthLabelActive]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </NativeScrollView>
        </View>

        {/* ── By category ── */}
        {byCategory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Por categoria</Text>
            {byCategory.map((entry, i) => {
              const pct   = total > 0 ? (entry.total / total) * 100 : 0;
              const color = entry.category?.color ?? "#94A3B8";
              return (
                <View key={i} style={styles.catRow}>
                  <View style={[styles.catDot, { backgroundColor: color }]} />
                  <View style={styles.catBody}>
                    <View style={styles.catTop}>
                      <Text style={styles.catName}>{entry.category?.name ?? "Sem categoria"}</Text>
                      <Text style={styles.catAmount}>{formatBRL(entry.total)}</Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${pct}%` as any, backgroundColor: color }]} />
                    </View>
                    <Text style={styles.catMeta}>
                      {entry.count} {entry.count === 1 ? "transação" : "transações"} • {pct.toFixed(0)}% do total
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ── All transactions ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Todos os registros</Text>

          {count === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={40} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>Nenhuma despesa encontrada nesse mês</Text>
            </View>
          ) : (
            sorted.map((t) => (
              <View key={t.id} style={styles.transactionRow}>
                <View style={[styles.transactionDot, { backgroundColor: getCategoryColor(t.categoryId) }]} />
                <View style={styles.transactionBody}>
                  <View style={styles.transactionTop}>
                    <Text style={styles.transactionDesc} numberOfLines={1}>
                      {t.description || getCategoryName(t.categoryId)}
                    </Text>
                    <Text style={styles.transactionAmount}>{formatBRL(Number(t.amount))}</Text>
                  </View>
                  <Text style={styles.transactionMeta}>
                    {formatDate(t.transactionDate)}
                    {"  •  "}{getCategoryName(t.categoryId)}
                    {"  •  "}{PAYMENT_METHOD_LABELS[t.paymentMethod] ?? t.paymentMethod}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: 56,
    paddingBottom: 40,
    paddingHorizontal: 24,
    overflow: "hidden",
  },
  bgIconWrap: {
    position: "absolute",
    right: -20,
    bottom: -20,
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
    marginTop: 20,
    gap: 6,
  },
  heroLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 2,
  },
  navArrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  navArrowDisabled: {
    opacity: 0.4,
  },
  heroNameWrap: {
    flex: 1,
    overflow: "hidden",
  },
  heroName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    textTransform: "capitalize",
  },
  heroTotal: {
    fontSize: 20,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
  },

  // Summary strip
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 16,
  },

  // Bar chart
  chartWrap: {
    alignItems: "flex-end",
    gap: BAR_GAP,
  },
  chartCol: {
    alignItems: "center",
    gap: 6,
  },
  chartValLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#A855F7",
    textAlign: "center",
  },
  chartBarWrap: {
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  chartBar: {
    width: "100%",
    borderRadius: 6,
    minHeight: 6,
  },
  chartMonthLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  chartMonthLabelActive: {
    color: "#fff",
    fontWeight: "700",
  },

  // Category breakdown
  catRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 18,
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  catBody: { flex: 1, gap: 6 },
  catTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  catName: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  catAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
  },
  barTrack: {
    height: 5,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
  catMeta: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },

  // Empty
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

  // Transaction list
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
  transactionBody: { flex: 1, gap: 4 },
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
});
