import Screen from "@/components/Screen";
import { useTheme } from "@/components/theme-switch/hooks";
import { AnimationType } from "@/components/theme-switch/types";
import { useCategory } from "@/contexts/categoryContext";
import { useTransactions } from "@/contexts/transactionContext";
import useAuth from "@/hooks/useAuth";
import BancoIcon from "@/services/apiBanco";
import * as cardService from "@/services/cardService";
import Card from "@/types/card";
import Transaction from "@/types/transaction";
import { getBancoNomeSafe, getBankColor } from "@/utils/banco";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  ScrollView as NativeScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const USER = {
  name: "Gustavo Sousa",
  memberSince: "03.2026",
  plan: "Básico",
};

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}


function darken(hex: string): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((n >> 16) & 0xff) - 40);
  const g = Math.max(0, ((n >> 8) & 0xff) - 40);
  const b = Math.max(0, (n & 0xff) - 40);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

type MonthlyTotal = {
  month: number;
  year: number;
  label: string;
  total: number;
  topCategoryId: string;
  topCategoryTotal: number;
  topCategoryCount: number;
  breakdown: { categoryId: string; pct: number }[];
};

function computeMonthlyTotals(transactions: Transaction[]): MonthlyTotal[] {
  const byMonth: Record<string, { month: number; year: number; txs: Transaction[] }> = {};
  for (const t of transactions) {
    if (t.type !== "EXPENSE") continue;
    const d = new Date(t.transactionDate);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!byMonth[key]) byMonth[key] = { month: d.getMonth(), year: d.getFullYear(), txs: [] };
    byMonth[key].txs.push(t);
  }
  return Object.values(byMonth)
    .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
    .map(({ month, year, txs }) => {
      const total = txs.reduce((s, t) => s + t.amount, 0);
      const catTotals: Record<string, { total: number; count: number }> = {};
      for (const t of txs) {
        if (!t.categoryId) continue;
        catTotals[t.categoryId] ??= { total: 0, count: 0 };
        catTotals[t.categoryId].total += t.amount;
        catTotals[t.categoryId].count += 1;
      }
      const topEntry = Object.entries(catTotals).sort((a, b) => b[1].total - a[1].total)[0];
      const breakdown = Object.entries(catTotals)
        .map(([categoryId, { total: ct }]) => ({ categoryId, pct: Math.round((ct / total) * 100) }))
        .filter((b) => b.pct >= 8)
        .sort((a, b) => b.pct - a.pct);
      return {
        month, year,
        label: MONTH_LABELS[month],
        total,
        topCategoryId: topEntry?.[0] ?? "",
        topCategoryTotal: topEntry?.[1].total ?? 0,
        topCategoryCount: topEntry?.[1].count ?? 0,
        breakdown,
      };
    });
}

const BAR_MAX_H = 60;
const BAR_ITEM_WIDTH = 52;
const BAR_GAP = 6;

function profile() {
  const router = useRouter();
  const { colors, toggleTheme, isDark } = useTheme();
  const { signOut } = useAuth();
  const styles = createStyles(colors);

  const { transactions } = useTransactions();
  const { categories } = useCategory();
  const [cards, setCards] = useState<Card[]>([]);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 16 });
  const gearRef = useRef<View>(null);
  const pendingTheme = useRef<{ touchX: number; touchY: number } | null>(null);

  useEffect(() => {
    if (!settingsOpen && pendingTheme.current) {
      const { touchX, touchY } = pendingTheme.current;
      pendingTheme.current = null;
      toggleTheme({
        animationType: isDark ? AnimationType.CircularInverted : AnimationType.Circular,
        touchX,
        touchY,
      });
    }
  }, [settingsOpen]);

  function openSettings() {
    gearRef.current?.measureInWindow((_x, y, _w, height) => {
      setDropdownPos({ top: y + height + 6, right: 24 });
      setSettingsOpen(true);
    });
  }

  useEffect(() => {
    cardService.getCards().then(setCards).catch(() => {});
  }, []);

  // ── Computed data ──────────────────────────────────────────────────────────
  const monthlyTotals = useMemo(
    () => computeMonthlyTotals(transactions ?? []),
    [transactions],
  );

  const chartMax = useMemo(
    () => Math.max(...monthlyTotals.map((m) => m.total), 1),
    [monthlyTotals],
  );

  const [monthIdx, setMonthIdx] = useState(0);
  useEffect(() => {
    if (monthlyTotals.length === 0) return;
    const now = new Date();
    const currentIdx = monthlyTotals.findIndex(
      (m) => m.month === now.getMonth() && m.year === now.getFullYear(),
    );
    setMonthIdx(currentIdx >= 0 ? currentIdx : monthlyTotals.length - 1);
  }, [monthlyTotals.length]);

  const today = new Date();
  const emptyMonth = {
    month: today.getMonth(),
    year: today.getFullYear(),
    label: MONTH_LABELS[today.getMonth()],
    total: 0,
    topCategoryId: "",
    topCategoryTotal: 0,
    topCategoryCount: 0,
    breakdown: [] as { categoryId: string; pct: number }[],
  };
  const currentMonth = monthlyTotals[monthIdx] ?? emptyMonth;

  const currentMonthIncome = useMemo(() => {
    if (!transactions || !currentMonth) return 0;
    return transactions
      .filter((t) => {
        if (t.type !== "INCOME") return false;
        const d = new Date(t.transactionDate);
        return d.getMonth() === currentMonth.month && d.getFullYear() === currentMonth.year;
      })
      .reduce((s, t) => s + t.amount, 0);
  }, [transactions, currentMonth]);

  // Top card: first credit card + how many credit card transactions this month
  const topCard = useMemo(() => {
    const creditCard = cards.find((c) => c.type === "CREDIT") ?? cards[0];
    if (!creditCard || !currentMonth) return null;
    const monthTxs = (transactions ?? []).filter((t) => {
      const d = new Date(t.transactionDate);
      return (
        d.getMonth() === currentMonth.month &&
        d.getFullYear() === currentMonth.year &&
        (t.paymentMethod === "CREDIT_CARD" || t.paymentMethod === "DEBIT_CARD")
      );
    });
    const total = monthTxs.reduce((s, t) => s + t.amount, 0);
    return { card: creditCard, total, purchases: monthTxs.length };
  }, [cards, transactions, currentMonth]);

  // Upcoming payments from card due dates
  const upcomingPayments = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDate();
    return cards
      .filter((c) => c.type === "CREDIT")
      .map((c) => {
        const daysUntilDue =
          c.dueDay >= currentDay
            ? c.dueDay - currentDay
            : new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - currentDay + c.dueDay;
        const status: "urgent" | "warning" | "normal" =
          daysUntilDue === 0 ? "urgent" : daysUntilDue <= 2 ? "warning" : "normal";
        const dueLabel =
          daysUntilDue === 0 ? "Hoje" : daysUntilDue === 1 ? "Amanhã" : `${daysUntilDue}d`;
        return { label: c.name, dueLabel, status, daysUntilDue };
      })
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }, [cards]);

  // ── Chart scroll & animations ──────────────────────────────────────────────
  const chartScrollRef = useRef<NativeScrollView>(null);
  const [chartWidth, setChartWidth] = useState(0);
  const isFirstRender = useRef(true);
  const directionRef = useRef<1 | -1>(1);
  const labelX = useRef(new Animated.Value(0)).current;
  const labelOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (chartWidth === 0) return;
    const x = monthIdx * (BAR_ITEM_WIDTH + BAR_GAP);
    chartScrollRef.current?.scrollTo({ x, animated: true });
  }, [monthIdx, chartWidth]);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    labelX.setValue(directionRef.current * 22);
    labelOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(labelX, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 280 }),
      Animated.timing(labelOpacity, { toValue: 1, duration: 160, useNativeDriver: true }),
    ]).start();
  }, [monthIdx]);

  function goToPrev() {
    if (monthIdx > 0) { directionRef.current = -1; setMonthIdx((i) => i - 1); }
  }
  function goToNext() {
    if (monthIdx < monthlyTotals.length - 1) { directionRef.current = 1; setMonthIdx((i) => i + 1); }
  }

  function handleMonthPress() {
    if (!currentMonth) return;
    router.push({
      pathname: "/(protected)/transaction/transactionsPage",
      params: { month: String(currentMonth.month), year: String(currentMonth.year), showChart: "true" },
    });
  }

  function handleTopCategoryPress() {
    if (!topCat) return;
    router.push({
      pathname: "/(protected)/category/categoryDetail",
      params: {
        id: topCat.id,
        month: String(currentMonth?.month),
        year: String(currentMonth?.year),
        sublabel: "Categoria + gasta",
      },
    });
  }

  const prevMonth = monthlyTotals[monthIdx - 1];
  const variation =
    prevMonth && currentMonth
      ? Math.round(((currentMonth.total - prevMonth.total) / prevMonth.total) * 100)
      : 0;
  const variationLabel = variation >= 0 ? `+${variation}%` : `${variation}%`;
  const variationColor = variation >= 0 ? "#F43F5E" : "#22C55E";

  const topCat = categories?.find((c) => c.id === currentMonth?.topCategoryId) ?? categories?.[0];
  const topCatColorEnd = topCat ? darken(topCat.color) : "#333";

  const initials = USER.name.split(" ").map((w) => w[0]).slice(0, 2).join("");

  return (
    <Screen style={{ padding: 0 }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* ── Settings Dropdown Modal ── */}
        <Modal transparent visible={settingsOpen} animationType="fade" onRequestClose={() => setSettingsOpen(false)}>
          <TouchableWithoutFeedback onPress={() => setSettingsOpen(false)}>
            <View style={styles.modalBackdrop}>
              <TouchableWithoutFeedback>
                <View style={[styles.dropdown, { top: dropdownPos.top, right: dropdownPos.right }]}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={(e) => {
                      pendingTheme.current = { touchX: e.nativeEvent.pageX, touchY: e.nativeEvent.pageY };
                      setSettingsOpen(false);
                    }}
                  >
                    <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={18} color="#fff" />
                    <Text style={styles.dropdownItemText}>{isDark ? "Modo claro" : "Modo escuro"}</Text>
                  </TouchableOpacity>
                  <View style={styles.dropdownDivider} />
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => { setSettingsOpen(false); signOut(); }}
                  >
                    <Ionicons name="log-out-outline" size={18} color="#F43F5E" />
                    <Text style={[styles.dropdownItemText, { color: "#F43F5E" }]}>Sair</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meu perfil</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.editBtn}>
              <Text style={styles.editBtnText}>Editar</Text>
            </TouchableOpacity>
            <View ref={gearRef}>
              <TouchableOpacity style={styles.iconBtn} onPress={openSettings}>
                <Ionicons name="settings-outline" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Avatar + stat pills ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarBorder}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          </View>

          <View style={styles.pillsRow}>
            <View style={[styles.statPill, styles.pillIncome]}>
              <View style={[styles.pillIconWrap, { backgroundColor: "rgba(34,197,94,0.25)" }]}>
                <Ionicons name="arrow-up" size={10} color="#22C55E" />
              </View>
              <Text style={styles.pillText}>{formatBRL(currentMonthIncome)}</Text>
            </View>
            <View style={[styles.statPill, styles.pillExpense]}>
              <View style={[styles.pillIconWrap, { backgroundColor: "rgba(244,63,94,0.25)" }]}>
                <Ionicons name="arrow-down" size={10} color="#F43F5E" />
              </View>
              <Text style={styles.pillText}>{formatBRL(currentMonth?.total ?? 0)}</Text>
            </View>
          </View>
        </View>

        {/* ── User info ── */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{USER.name}</Text>
          <Text style={styles.userMeta}>
            {"Por aqui desde "}
            <Text style={styles.userMetaBold}>{USER.memberSince}</Text>
            {"  •  "}{USER.plan}
          </Text>
        </View>

        {/* ── Tab row ── */}
        <View style={styles.tabRow}>
          <Text style={[styles.tabText, styles.tabActive]}>Visão Geral</Text>
          <View style={styles.tabLine} />
          <Text style={styles.tabText}>Detalhado</Text>
        </View>

        {/* ── Month selector ── */}
        <View style={styles.monthSelectorRow}>
          <TouchableOpacity
            style={[styles.monthArrow, monthIdx === 0 && styles.monthArrowDisabled]}
            onPress={goToPrev}
            disabled={monthIdx === 0}
          >
            <FontAwesome name="chevron-left" size={13} color={monthIdx === 0 ? colors.glass : colors.text} />
          </TouchableOpacity>
          <View style={styles.monthLabelWrap}>
            <Animated.Text style={[styles.monthSelectorLabel, { transform: [{ translateX: labelX }], opacity: labelOpacity }]}>
              {currentMonth.label} {currentMonth.year}
            </Animated.Text>
          </View>
          <TouchableOpacity
            style={[styles.monthArrow, monthIdx === monthlyTotals.length - 1 && styles.monthArrowDisabled]}
            onPress={goToNext}
            disabled={monthIdx === monthlyTotals.length - 1}
          >
            <FontAwesome name="chevron-right" size={13} color={monthIdx === monthlyTotals.length - 1 ? "rgba(255,255,255,0.2)" : colors.text} />
          </TouchableOpacity>
        </View>

        {/* ── Cards grid ── */}
        <View style={styles.grid}>

          {/* Bar chart card */}
          <View style={styles.card}>
            <View style={styles.chartHeader}>
              <View>
                <Text style={styles.cardHeading}>Histórico</Text>
                <Text style={styles.cardSublabel}>Gastos mensais</Text>
              </View>
              {prevMonth && (
                <View style={styles.variationBadge}>
                  <Text style={[styles.variationText, { color: variationColor }]}>{variationLabel}</Text>
                  <Text style={styles.variationSub}>vs mês ant.</Text>
                </View>
              )}
            </View>
            {monthlyTotals.length === 0 ? (
              <View style={styles.emptyChart}>
                <Text style={styles.emptyChartText}>Sem transações registradas</Text>
              </View>
            ) : (
              <NativeScrollView
                ref={chartScrollRef}
                horizontal
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
                contentContainerStyle={[
                  styles.chartWrap,
                  { paddingHorizontal: chartWidth > 0 ? (chartWidth - BAR_ITEM_WIDTH) / 2 : 0 },
                ]}
              >
                {monthlyTotals.map((m, i) => {
                  const isSelected = i === monthIdx;
                  const barH = Math.max(6, (m.total / chartMax) * BAR_MAX_H);
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[styles.chartCol, { width: BAR_ITEM_WIDTH }]}
                      onPress={() => { directionRef.current = i > monthIdx ? 1 : -1; setMonthIdx(i); }}
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
            )}
          </View>

          {/* Row: Gastos + Categoria mais gasta */}
          {currentMonth && (
            <View style={styles.gridRow}>
              <TouchableOpacity onPress={handleMonthPress} style={{ flex: 1 }} activeOpacity={0.85}>
                <View style={[styles.card, { flex: 1, minHeight: 100 }]}>
                  <Text style={styles.cardHeading}>{currentMonth.label}</Text>
                  <Text style={styles.cardSublabel}>Meus Gastos</Text>
                  <View style={styles.amountLine}>
                    <Text style={styles.amountSm}>{formatBRL(currentMonth.total)}</Text>
                    <Text style={[styles.tagVariation, { color: variationColor }]}>{variationLabel}</Text>
                  </View>
                  <Text style={styles.cardSublabel}>Por categorias</Text>
                  <View style={styles.bars}>
                    {currentMonth.breakdown.map((b) => {
                      const cat = categories?.find((c) => c.id === b.categoryId);
                      return (
                        <View key={b.categoryId} style={[styles.bar, { flex: b.pct, backgroundColor: cat?.color ?? "#94A3B8" }]} />
                      );
                    })}
                  </View>
                </View>
              </TouchableOpacity>

              {topCat && (
                <TouchableOpacity onPress={handleTopCategoryPress} style={{ flex: 1 }} activeOpacity={0.85}>
                  <LinearGradient
                    colors={[topCat.color, topCatColorEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.card, { flex: 1, minHeight: 100, overflow: "hidden" }]}
                  >
                    <View style={styles.catIconWrap}>
                      <FontAwesome name={topCat.icon as any} size={100} color="rgba(255,255,255,0.1)" />
                      <LinearGradient
                        colors={["transparent", topCatColorEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={StyleSheet.absoluteFillObject}
                      />
                    </View>
                    <Text style={styles.catName}>{topCat.name}</Text>
                    <Text style={styles.catSublabel}>Categoria + gasta</Text>
                    <View style={{ flex: 1 }} />
                    <Text style={styles.catCount}>{currentMonth.topCategoryCount} registros</Text>
                    <Text style={styles.catAmount}>{formatBRL(currentMonth.topCategoryTotal)}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Cartão mais usado */}
          <View style={[styles.card, { flexDirection: "row", padding: 0 }]}>
            <LinearGradient
              colors={topCard
                ? [getBankColor(topCard.card.name), darken(getBankColor(topCard.card.name))]
                : ["#2D2D3F", "#1A1A2E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.miniCard, { margin: 14, height: undefined }]}
            >
              <View style={styles.miniCardHeader}>
                {topCard
                  ? <BancoIcon nome={getBancoNomeSafe(topCard.card.name)} formato="sem" tamanho={28} />
                  : <View style={styles.miniCardLogo} />
                }
                <Text style={styles.miniCardDigits}>
                  {topCard ? `···· ${topCard.card.last4Digits}` : "····"}
                </Text>
              </View>
              <View>
                <Text style={styles.miniCardName}>{topCard ? topCard.card.name : "Nenhum cartão"}</Text>
                <Text style={styles.miniCardType}>
                  {topCard ? (topCard.card.type === "CREDIT" ? "Crédito" : "Débito") : "—"}
                </Text>
              </View>
            </LinearGradient>
            <View style={{ flex: 1, gap: 3, paddingRight: 14, paddingVertical: 14 }}>
              <Text style={styles.cardHeading}>Cartão + usado</Text>
              <Text style={styles.cardSublabel}>nesse mês</Text>
              <View style={styles.amountLine}>
                <Text style={styles.amountMd}>{formatBRL(topCard?.total ?? 0)}</Text>
              </View>
              <Text style={styles.cardSublabel}>{topCard?.purchases ?? 0} compras</Text>
            </View>
          </View>

          {/* Pagamentos próximos + Plano */}
          <View style={styles.gridRow}>
            <View style={[styles.card, { flex: 1, gap: 8 }]}>
              <Text style={styles.upcomingTitle}>Tá chegando!</Text>
              <Text style={styles.cardSublabel}>Contas próximas</Text>
              {upcomingPayments.length === 0 ? (
                <Text style={styles.emptyChartText}>Nenhuma conta próxima</Text>
              ) : (
                upcomingPayments.map((item, i) => (
                  <View key={i} style={styles.payRow}>
                    <View style={styles.payLeft}>
                      <FontAwesome name="credit-card" size={12} color={colors.textSecondary} style={{ width: 14 }} />
                      <Text style={styles.payLabel} numberOfLines={1}>{item.label}</Text>
                    </View>
                    <Text
                      style={[
                        styles.payDate,
                        item.status === "urgent" && { color: "#F97316" },
                        item.status === "warning" && { color: "#FACC15" },
                      ]}
                    >
                      {item.dueLabel}
                    </Text>
                  </View>
                ))
              )}
            </View>

            <View style={[styles.card, styles.planCard]}>
              <Ionicons name="pricetag-outline" size={32} color={colors.text} />
              <Text style={styles.planName}>{USER.plan}</Text>
              <Text style={styles.cardSublabel}>Meu plano</Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </Screen>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 24, paddingTop: 60, paddingBottom: 10,
  },
  headerTitle: { fontSize: 28, fontWeight: "700", color: colors.text },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  editBtn: {
    paddingHorizontal: 18, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)",
  },
  editBtnText: { color: colors.text, fontSize: 14, fontWeight: "500" },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 0.5, borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center", justifyContent: "center",
  },

  avatarSection: { alignItems: "center", paddingTop: 20 },
  pillsRow: {
    flexDirection: "row", justifyContent: "space-between",
    width: "100%", paddingHorizontal: 66, marginTop: -26,
  },
  statPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 10, paddingVertical: 8, borderRadius: 16, borderWidth: 1,
  },
  pillIncome:  { backgroundColor: "rgba(34,197,94,0.1)",  borderColor: "rgba(34,197,94,0.3)" },
  pillExpense: { backgroundColor: "rgba(244,63,94,0.1)",  borderColor: "rgba(244,63,94,0.3)" },
  pillIconWrap: { width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  pillText: { fontSize: 12, fontWeight: "600", color: colors.text },
  avatarBorder: {
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 3, borderColor: colors.primary, overflow: "hidden",
  },
  avatarCircle: { flex: 1, backgroundColor: "rgba(124, 58, 237, 0.2)", alignItems: "center", justifyContent: "center" },
  avatarInitials: { fontSize: 40, fontWeight: "700", color: colors.primaryForeground },

  userInfo: { alignItems: "center", paddingHorizontal: 20, marginTop: 14, gap: 4, marginBottom: 20 },
  userName: { fontSize: 30, fontWeight: "800", color: colors.text },
  userMeta: { fontSize: 13, color: colors.textSecondary },
  userMetaBold: { fontWeight: "700", color: colors.text },

  tabRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, gap: 12, marginBottom: 12,
  },
  tabText: { fontSize: 13, color: colors.textSecondary, fontWeight: "500" },
  tabActive: { color: colors.text, fontWeight: "600" },
  tabLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.1)" },

  monthSelectorRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingHorizontal: 20, marginBottom: 16, gap: 12,
  },
  monthArrow: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 0.5, borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center", justifyContent: "center",
  },
  monthArrowDisabled: { opacity: 0.3 },
  monthLabelWrap: { flex: 1, alignItems: "center", overflow: "hidden" },
  monthSelectorLabel: { fontSize: 15, fontWeight: "700", color: colors.text, textTransform: "capitalize" },

  grid: { paddingHorizontal: 16, gap: 12, marginBottom: 80 },
  gridRow: { flexDirection: "row", gap: 12 },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 16 },

  chartHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 16,
  },
  variationBadge: { alignItems: "flex-end", gap: 2 },
  variationText: { fontSize: 15, fontWeight: "700" },
  variationSub: { fontSize: 11, color: colors.textSecondary },
  chartWrap: { alignItems: "flex-end", gap: BAR_GAP, marginTop: 4 },
  chartCol: { alignItems: "center", gap: 5 },
  chartValLabel: { fontSize: 9, fontWeight: "700", color: "#A855F7", textAlign: "center" },
  chartBarWrap: { width: "100%", justifyContent: "flex-end", alignItems: "center" },
  chartBar: { width: "100%", borderRadius: 6, minHeight: 6 },
  chartMonthLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: "500" },
  chartMonthLabelActive: { color: "#fff", fontWeight: "700" },

  cardHeading: { fontSize: 20, fontWeight: "700", color: colors.text },
  cardSublabel: { fontSize: 15, color: colors.textSecondary },
  amountLine: {
    flexDirection: "row", alignItems: "baseline",
    gap: 5, marginTop: 8, marginBottom: 4, flexWrap: "wrap",
  },
  amountSm: { fontSize: 20, fontWeight: "700", color: colors.text },
  amountMd: { fontSize: 20, fontWeight: "700", color: colors.text },
  tagVariation: { fontSize: 13, fontWeight: "600" },
  tagGreen: { fontSize: 13, fontWeight: "600", color: "#22C55E" },
  bars: { flexDirection: "row", gap: 4, marginTop: 10, height: 7 },
  bar: { flex: 1, borderRadius: 4 },

  catName: { fontSize: 20, fontWeight: "800", color: "#fff" },
  catSublabel: { fontSize: 15, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  catIconWrap: { position: "absolute", left: 0, right: 0, bottom: 0, alignItems: "center" },
  catCount: { fontSize: 15, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  catAmount: { fontSize: 20, fontWeight: "800", color: "#fff", marginTop: 2 },

  miniCard: { width: 140, borderRadius: 14, padding: 12, justifyContent: "space-between" },
  miniCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  miniCardLogo: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center",
  },
  miniCardLogoText: { fontSize: 9, color: "#fff", fontWeight: "800" },
  miniCardDigits: { fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: "600" },
  miniCardName: { fontSize: 15, fontWeight: "700", color: "#fff" },
  miniCardType: { fontSize: 13, color: "rgba(255,255,255,0.7)" },

  upcomingTitle: { fontSize: 20, fontWeight: "700", color: colors.text },
  payRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  payLeft: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  payLabel: { fontSize: 13, color: colors.text, flex: 1 },
  payDate: { fontSize: 13, color: colors.textSecondary, fontWeight: "500" },

  planCard: {
    flex: 1, aspectRatio: 1, alignSelf: "flex-start",
    backgroundColor: "#1F2937", justifyContent: "flex-end", gap: 4,
  },
  planName: { fontSize: 22, fontWeight: "800", color: colors.text, marginTop: 8 },

  modalBackdrop: { flex: 1 },
  dropdown: {
    position: "absolute",
    backgroundColor: "#1E1E2E",
    borderRadius: 14,
    paddingVertical: 6,
    minWidth: 180,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  dropdownItem: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingVertical: 13,
  },
  dropdownItemText: { fontSize: 15, fontWeight: "500", color: "#fff" },
  dropdownDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.08)", marginHorizontal: 12 },

  emptyChart: { height: 80, alignItems: "center", justifyContent: "center" },
  emptyChartText: { fontSize: 13, color: colors.textSecondary },
});

export default profile;
