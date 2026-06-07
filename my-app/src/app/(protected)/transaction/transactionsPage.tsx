import CardTransaction from "@/components/CardTransaction";
import { ChipGroup } from "@/components/chip-group/Chip";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/empty-state";
import FloatingButton from "@/components/FloatingButton";
import Screen from "@/components/Screen";
import { SearchBar } from "@/components/search-bar/SearchBar";
import { Shimmer } from "@/components/shimmer/Shimmer";
import { useCategory } from "@/contexts/categoryContext";
import { useTransactions } from "@/contexts/transactionContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import Transaction from "@/types/transaction";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  ScrollView as NativeScrollView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ── Constants ────────────────────────────────────────────────────────────────

const MONTH_LABELS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const BAR_MAX_H = 72;
const BAR_ITEM_WIDTH = 52;
const BAR_GAP = 6;

const FILTER_GRADIENT: Record<string, [string, string]> = {
  all:      ["#7C3AED", "#4C1D95"],
  INCOME:   ["#16A34A", "#14532D"],
  EXPENSE:  ["#E11D48", "#881337"],
  TRANSFER: ["#EA580C", "#7C2D12"],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function normalizeText(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

type MonthlyTotal = { month: number; year: number; label: string; total: number };

function computeMonthlyTotals(transactions: Transaction[]): MonthlyTotal[] {
  const byMonth: Record<string, { month: number; year: number; total: number }> = {};
  for (const t of transactions) {
    if (t.type !== "EXPENSE") continue;
    const d = new Date(t.transactionDate);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!byMonth[key]) byMonth[key] = { month: d.getMonth(), year: d.getFullYear(), total: 0 };
    byMonth[key].total += t.amount;
  }
  return Object.values(byMonth)
    .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
    .map(({ month, year, total }) => ({ month, year, total, label: MONTH_LABELS[month] }));
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TransactionPage() {
  const router = useRouter();
  const { transactions } = useTransactions();
  const { categories } = useCategory();
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const params = useLocalSearchParams<{
    type?: string;
    month?: string;
    year?: string;
    showChart?: string;
  }>();

  const showChart = params.showChart === "true";
  const activeType = params.type ?? "all";
  const now = new Date();

  const [selMonth, setSelMonth] = useState(
    params.month !== undefined ? Number(params.month) : now.getMonth()
  );
  const [selYear, setSelYear] = useState(
    params.year !== undefined ? Number(params.year) : now.getFullYear()
  );
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Chart scroll
  const chartScrollRef = useRef<NativeScrollView>(null);
  const [chartWidth, setChartWidth] = useState(0);

  // Month label animation
  const isFirstRender = useRef(true);
  const directionRef = useRef<1 | -1>(1);
  const labelX = useRef(new Animated.Value(0)).current;
  const labelOpacity = useRef(new Animated.Value(1)).current;

  // ── Data ────────────────────────────────────────────────────────────────────

  const monthlyTotals = useMemo(
    () => computeMonthlyTotals(transactions ?? []),
    [transactions]
  );

  const chartMax = useMemo(
    () => Math.max(...monthlyTotals.map(m => m.total), 1),
    [monthlyTotals]
  );

  const selectedChartIdx = monthlyTotals.findIndex(
    m => m.month === selMonth && m.year === selYear
  );

  const filteredTransactions = useMemo(() => {
    return (transactions ?? [])
      .filter(item => {
        const d = new Date(item.transactionDate);
        if (d.getMonth() !== selMonth || d.getFullYear() !== selYear) return false;
        if (activeType !== "all" && item.type !== activeType) return false;
        if (search) {
          const catName = categories?.find(c => c.id === item.categoryId)?.name ?? "";
          return normalizeText(`${item.description ?? ""} ${item.amount} ${catName}`)
            .includes(normalizeText(search));
        }
        return true;
      })
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
  }, [transactions, selMonth, selYear, activeType, search, categories]);

  const count = filteredTransactions.length;

  const summaryItems = useMemo(() => {
    if (activeType !== "all") {
      const total = filteredTransactions.reduce((s, t) => s + Number(t.amount), 0);
      const avg   = count > 0 ? total / count : 0;
      const color = activeType === "INCOME" ? "#22C55E"
                  : activeType === "EXPENSE" ? "#F43F5E" : "#FF9800";
      return [
        { label: "Total",     value: formatBRL(total), color },
        { label: "Média",     value: formatBRL(avg),   color: undefined },
        { label: "Registros", value: String(count),    color: undefined },
      ];
    }
    const inc = filteredTransactions.filter(t => t.type === "INCOME").reduce((s, t) => s + Number(t.amount), 0);
    const exp = filteredTransactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + Number(t.amount), 0);
    return [
      { label: "Entradas",  value: formatBRL(inc), color: "#22C55E" as string | undefined },
      { label: "Saídas",    value: formatBRL(exp), color: "#F43F5E" as string | undefined },
      { label: "Registros", value: String(count),  color: undefined },
    ];
  }, [activeType, filteredTransactions, count]);

  const categoryTotals = useMemo(() => {
    const expenses  = filteredTransactions.filter(t => t.type === "EXPENSE");
    const totalExp  = expenses.reduce((s, t) => s + Number(t.amount), 0);
    if (totalExp === 0) return [];
    const map: Record<string, { name: string; color: string; total: number; count: number }> = {};
    for (const t of expenses) {
      const cat = categories?.find(c => c.id === t.categoryId);
      const key = String(t.categoryId ?? "__none__");
      if (!map[key]) map[key] = { name: cat?.name ?? "Outros", color: cat?.color ?? "#7C3AED", total: 0, count: 0 };
      map[key].total += Number(t.amount);
      map[key].count += 1;
    }
    return Object.values(map)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map(c => ({ ...c, pct: (c.total / totalExp) * 100 }));
  }, [filteredTransactions, categories]);

  const expenseTotal = useMemo(
    () => filteredTransactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + Number(t.amount), 0),
    [filteredTransactions]
  );

  // ── Month navigation ────────────────────────────────────────────────────────

  const firstEntry = monthlyTotals[0];
  const lastEntry  = monthlyTotals[monthlyTotals.length - 1];
  const isAtFirst  = firstEntry ? selYear === firstEntry.year && selMonth === firstEntry.month : true;
  const isAtLast   = lastEntry  ? selYear === lastEntry.year  && selMonth === lastEntry.month  : true;

  function goToPrev() {
    if (isAtFirst) return;
    directionRef.current = -1;
    const d = new Date(selYear, selMonth - 1);
    setSelMonth(d.getMonth());
    setSelYear(d.getFullYear());
  }

  function goToNext() {
    if (isAtLast) return;
    directionRef.current = 1;
    const d = new Date(selYear, selMonth + 1);
    setSelMonth(d.getMonth());
    setSelYear(d.getFullYear());
  }

  const monthLabel = new Date(selYear, selMonth).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  // ── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (chartWidth === 0 || selectedChartIdx < 0) return;
    const x = selectedChartIdx * (BAR_ITEM_WIDTH + BAR_GAP);
    chartScrollRef.current?.scrollTo({ x, animated: true });
  }, [selectedChartIdx, chartWidth]);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    labelX.setValue(directionRef.current * 22);
    labelOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(labelX,      { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 280 }),
      Animated.timing(labelOpacity, { toValue: 1, duration: 160, useNativeDriver: true }),
    ]).start();
  }, [selMonth, selYear]);

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (transactions !== undefined) { setIsLoading(false); return; }
    const t = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(t);
  }, [transactions]);

  // ── Chips ────────────────────────────────────────────────────────────────────

  const chips = [
    { key: "all",      label: "Todas",          icon: () => <Ionicons name="list"           size={18} color="white" />, activeColor: theme.colors.primary },
    { key: "INCOME",   label: "Entradas",        icon: () => <Ionicons name="arrow-up"       size={18} color="white" />, activeColor: "#16A34A" },
    { key: "EXPENSE",  label: "Saídas",          icon: () => <Ionicons name="arrow-down"     size={18} color="white" />, activeColor: "#E11D48" },
    { key: "TRANSFER", label: "Transferência",   icon: () => <Ionicons name="swap-vertical"  size={18} color="white" />, activeColor: "#EA580C" },
  ];

  const gradientColors = FILTER_GRADIENT[activeType] ?? FILTER_GRADIENT.all;

  // ── Header ───────────────────────────────────────────────────────────────────

  const ListHeader = (
    <>
      {/* Hero gradient */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.bgIconWrap} pointerEvents="none">
          <Ionicons name="wallet-outline" size={180} color="rgba(255,255,255,0.07)" />
        </View>

        {/* Nav row */}
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={16} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>
          {!showChart && (
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => { setShowSearch(v => !v); if (showSearch) setSearch(""); }}
            >
              <Ionicons
                name={showSearch ? "close" : "search"}
                size={18}
                color="rgba(255,255,255,0.85)"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Hero content */}
        {showSearch && !showChart ? (
          <View style={styles.searchWrap}>
            <SearchBar
              tint="rgba(255,255,255,0.7)"
              placeholder="Pesquisar"
              onSearch={setSearch}
              onClear={() => setSearch("")}
              onSearchDone={() => {}}
              style={styles.searchBar}
            />
          </View>
        ) : (
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>
              {showChart ? "Meus Gastos" : "Minhas transações"}
            </Text>

            {/* Month navigation */}
            <View style={styles.monthNav}>
              <TouchableOpacity
                style={[styles.navArrow, isAtFirst && styles.navArrowDisabled]}
                onPress={goToPrev}
                disabled={isAtFirst}
              >
                <FontAwesome
                  name="chevron-left"
                  size={14}
                  color={isAtFirst ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.85)"}
                />
              </TouchableOpacity>

              <View style={styles.monthLabelWrap}>
                <Animated.Text
                  style={[
                    styles.heroTitle,
                    { transform: [{ translateX: labelX }], opacity: labelOpacity },
                  ]}
                  numberOfLines={1}
                >
                  {monthLabel}
                </Animated.Text>
              </View>

              <TouchableOpacity
                style={[styles.navArrow, isAtLast && styles.navArrowDisabled]}
                onPress={goToNext}
                disabled={isAtLast}
              >
                <FontAwesome
                  name="chevron-right"
                  size={14}
                  color={isAtLast ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.85)"}
                />
              </TouchableOpacity>
            </View>

            {showChart && (
              <Text style={styles.heroTotal}>{formatBRL(expenseTotal)}</Text>
            )}
          </View>
        )}
      </LinearGradient>

      {/* Summary strip */}
      <View style={styles.summaryRow}>
        {summaryItems.map((item, i) => (
          <View key={item.label} style={{ flex: 1, flexDirection: "row" }}>
            {i > 0 && <View style={styles.summaryDivider} />}
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, item.color ? { color: item.color } : {}]}>
                {item.value}
              </Text>
              <Text style={styles.summaryLabel}>{item.label}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Bar chart — only when showChart=true */}
      {showChart && monthlyTotals.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico</Text>
          <NativeScrollView
            ref={chartScrollRef}
            horizontal
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            onLayout={e => setChartWidth(e.nativeEvent.layout.width)}
            contentContainerStyle={[
              styles.chartWrap,
              {
                paddingHorizontal: chartWidth > 0
                  ? (chartWidth - BAR_ITEM_WIDTH) / 2
                  : 0,
              },
            ]}
          >
            {monthlyTotals.map((m, i) => {
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
                      colors={
                        isSelected
                          ? ["#A855F7", "#7C3AED"]
                          : ["rgba(255,255,255,0.14)", "rgba(255,255,255,0.07)"]
                      }
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
      )}

      {/* Chips */}
      <View style={styles.chipWrapper}>
        <ChipGroup
          chips={chips}
          selectedIndex={chips.findIndex(c => c.key === activeType)}
          onChange={index => {
            const key = chips[index].key;
            router.setParams({ type: key === "all" ? undefined : key });
          }}
        />
      </View>

      {/* Category breakdown */}
      {categoryTotals.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Por categoria</Text>
          {categoryTotals.map(cat => (
            <View key={cat.name} style={styles.catRow}>
              <View style={[styles.catDot, { backgroundColor: cat.color }]} />
              <View style={styles.catBody}>
                <View style={styles.catTop}>
                  <Text style={styles.catName}>{cat.name}</Text>
                  <Text style={styles.catAmount}>{formatBRL(cat.total)}</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${cat.pct}%` as any, backgroundColor: cat.color }]} />
                </View>
                <Text style={styles.catMeta}>
                  {cat.count} {cat.count === 1 ? "transação" : "transações"} • {cat.pct.toFixed(0)}% do total
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Registros header */}
      {!isLoading && count > 0 && (
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Registros</Text>
        </View>
      )}
    </>
  );

  // ── Empty / loading ──────────────────────────────────────────────────────────

  const EmptyOrLoading = isLoading ? (
    <View style={styles.skeletonWrap}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Shimmer key={i} style={styles.transactionSkeleton} />
      ))}
    </View>
  ) : (
    <View style={styles.emptyWrap}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon" style={{ backgroundColor: theme.colors.surface }}>
            {Platform.OS === "ios" ? (
              <SymbolView name="arrow.up.arrow.down" size={60} tintColor={theme.colors.text} />
            ) : (
              <Ionicons name="swap-vertical" size={60} color={theme.colors.text} />
            )}
          </EmptyMedia>
          <EmptyTitle>
            {search ? `Nenhum resultado para "${search}"` : "Nenhuma transação"}
          </EmptyTitle>
          <View style={styles.emptyContent}>
            <EmptyDescription>
              {search ? "Tente outros termos" : "Que tal começar criando uma transação"}
            </EmptyDescription>
          </View>
        </EmptyHeader>
      </Empty>
    </View>
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Screen style={{ padding: 0 }}>
      <FlatList
        data={isLoading ? [] : filteredTransactions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <CardTransaction item={item} />
          </View>
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyOrLoading}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <FloatingButton
        style={styles.fab}
        onPress={() => router.push("/transaction/createTransaction")}
      />
    </Screen>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    hero: {
      paddingTop: 56,
      paddingBottom: 44,
      paddingHorizontal: 24,
      overflow: "hidden",
    },

    bgIconWrap: {
      position: "absolute",
      right: -20,
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
      gap: 8,
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

    monthLabelWrap: {
      flex: 1,
      overflow: "hidden",
    },

    heroTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: "#fff",
      textTransform: "capitalize",
    },

    heroTotal: {
      fontSize: 20,
      fontWeight: "600",
      color: "rgba(255,255,255,0.85)",
      marginTop: 2,
    },

    searchWrap: {
      marginTop: 20,
    },

    searchBar: {
      backgroundColor: "rgba(0,0,0,0.25)",
      borderRadius: 12,
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
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.text,
    },

    summaryLabel: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    chipWrapper: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },

    section: {
      marginTop: 28,
      paddingHorizontal: 20,
    },

    sectionTitle: {
      fontSize: 17,
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

    listHeader: {
      paddingHorizontal: 20,
      paddingTop: 28,
      paddingBottom: 0,
    },

    cardWrap: {
      paddingHorizontal: 20,
      marginBottom: 12,
    },

    listContent: {
      paddingBottom: 120,
    },

    skeletonWrap: {
      paddingHorizontal: 20,
      paddingTop: 16,
      gap: 12,
    },

    transactionSkeleton: {
      width: "100%",
      height: 80,
      borderRadius: 12,
    },

    emptyWrap: {
      paddingTop: 40,
    },

    emptyContent: {
      alignItems: "center",
      gap: 15,
      marginTop: 8,
    },

    fab: {
      bottom: 32,
      right: 20,
    },
  });
