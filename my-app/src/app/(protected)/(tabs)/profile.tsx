import theme from "@/app/themes/theme";
import Screen from "@/components/Screen";
import {
  MOCK_CATEGORIES,
  MOCK_MONTHLY_TOTALS,
} from "@/mocks/profileMocks";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView as NativeScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const USER = {
  name: "Gustavo Sousa",
  memberSince: "03.2026",
  plan: "Básico",
};

const MOCK_STATS = {
  income: 780.0,
};

const MOCK_TOP_CARD = {
  name: "MercadoPago",
  type: "Crédito",
  last4: "1234",
  total: 421.28,
  variation: -5,
  purchases: 13,
};

const MOCK_PAYMENTS: {
  icon: string;
  label: string;
  dueLabel: string;
  status: "urgent" | "warning" | "normal";
}[] = [
    { icon: "credit-card", label: "MercadoPago",     dueLabel: "Hoje",   status: "urgent" },
    { icon: "diamond",     label: "Perfume Avon",    dueLabel: "Hoje",   status: "urgent" },
    { icon: "file-text-o", label: "Consórcio Hon...", dueLabel: "Amanhã", status: "warning" },
    { icon: "television",  label: "Netflix",          dueLabel: "2d",     status: "normal" },
    { icon: "file-text-o", label: "Financiamento...", dueLabel: "5d",     status: "normal" },
    { icon: "credit-card", label: "Nubank",           dueLabel: "7d",     status: "normal" },
  ];

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

const BAR_MAX_H = 60;
const BAR_ITEM_WIDTH = 52;
const BAR_GAP = 6;
const chartMax = Math.max(...MOCK_MONTHLY_TOTALS.map((m) => m.total));

function profile() {
  const router = useRouter();

  const [monthIdx, setMonthIdx] = useState(MOCK_MONTHLY_TOTALS.length - 1);
  const currentMonth = MOCK_MONTHLY_TOTALS[monthIdx];

  // Chart scroll centering
  const chartScrollRef = useRef<NativeScrollView>(null);
  const [chartWidth, setChartWidth] = useState(0);

  // Month label transition animation
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
  }, [monthIdx]);

  function goToPrev() {
    if (monthIdx > 0) {
      directionRef.current = -1;
      setMonthIdx((i) => i - 1);
    }
  }

  function goToNext() {
    if (monthIdx < MOCK_MONTHLY_TOTALS.length - 1) {
      directionRef.current = 1;
      setMonthIdx((i) => i + 1);
    }
  }

  function handleMonthPress() {
    router.push({
      pathname: "/(protected)/profile/monthDetail",
      params: {
        month: String(currentMonth.month),
        year: String(currentMonth.year),
      },
    });
  }

  function handleTopCategoryPress() {
    router.push({
      pathname: "/(protected)/profile/categoryDetail",
      params: {
        categoryId: topCat.id,
        categoryName: topCat.name,
        categoryColor: topCat.color,
        categoryColorEnd: topCatColorEnd,
        categoryIcon: topCat.icon,
        month: String(currentMonth.month),
        year: String(currentMonth.year),
      },
    });
  }

  const prevMonth = MOCK_MONTHLY_TOTALS[monthIdx - 1];
  const variation = prevMonth
    ? Math.round(((currentMonth.total - prevMonth.total) / prevMonth.total) * 100)
    : 0;
  const variationLabel = variation >= 0 ? `+${variation}%` : `${variation}%`;
  const variationColor = variation >= 0 ? "#F43F5E" : "#22C55E";

  const topCat = MOCK_CATEGORIES.find((c) => c.id === currentMonth.topCategoryId) ?? MOCK_CATEGORIES[0];
  const topCatColorEnd = darken(topCat.color);

  return (
    <Screen style={{ padding: 0 }}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meu perfil</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.editBtn}>
              <Text style={styles.editBtnText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="settings-outline" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Avatar + stat pills ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarBorder}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>GS</Text>
            </View>
          </View>

          <View style={styles.pillsRow}>
            <View style={[styles.statPill, styles.pillIncome]}>
              <View style={[styles.pillIconWrap, { backgroundColor: "rgba(34,197,94,0.25)" }]}>
                <Ionicons name="arrow-up" size={10} color="#22C55E" />
              </View>
              <Text style={styles.pillText}>{formatBRL(MOCK_STATS.income)}</Text>
            </View>

            <View style={[styles.statPill, styles.pillExpense]}>
              <View style={[styles.pillIconWrap, { backgroundColor: "rgba(244,63,94,0.25)" }]}>
                <Ionicons name="arrow-down" size={10} color="#F43F5E" />
              </View>
              <Text style={styles.pillText}>{formatBRL(currentMonth.total)}</Text>
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
            <FontAwesome name="chevron-left" size={13} color={monthIdx === 0 ? "rgba(255,255,255,0.2)" : theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.monthLabelWrap}>
            <Animated.Text
              style={[
                styles.monthSelectorLabel,
                { transform: [{ translateX: labelX }], opacity: labelOpacity },
              ]}
            >
              {currentMonth.label} {currentMonth.year}
            </Animated.Text>
          </View>

          <TouchableOpacity
            style={[styles.monthArrow, monthIdx === MOCK_MONTHLY_TOTALS.length - 1 && styles.monthArrowDisabled]}
            onPress={goToNext}
            disabled={monthIdx === MOCK_MONTHLY_TOTALS.length - 1}
          >
            <FontAwesome name="chevron-right" size={13} color={monthIdx === MOCK_MONTHLY_TOTALS.length - 1 ? "rgba(255,255,255,0.2)" : theme.colors.text} />
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
              <View style={styles.variationBadge}>
                <Text style={[styles.variationText, { color: variationColor }]}>{variationLabel}</Text>
                <Text style={styles.variationSub}>vs mês ant.</Text>
              </View>
            </View>

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
                const isSelected = i === monthIdx;
                const barH = Math.max(6, (m.total / chartMax) * BAR_MAX_H);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.chartCol, { width: BAR_ITEM_WIDTH }]}
                    onPress={() => {
                      directionRef.current = i > monthIdx ? 1 : -1;
                      setMonthIdx(i);
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

          {/* Row: Gastos + Categoria mais gasta */}
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
                  {(currentMonth.breakdown ?? [])
                    .filter((b) => b.pct >= 8)
                    .map((b) => {
                      const cat = MOCK_CATEGORIES.find((c) => c.id === b.categoryId);
                      return (
                        <View
                          key={b.categoryId}
                          style={[styles.bar, { flex: b.pct, backgroundColor: cat?.color ?? "#94A3B8" }]}
                        />
                      );
                    })}
                </View>
              </View>
            </TouchableOpacity>

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
          </View>

          {/* Cartão mais usado */}
          <View style={[styles.card, { flexDirection: "row", padding: 0 }]}>
            <LinearGradient
              colors={["#22D3EE", "#0891B2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.miniCard, { margin: 14, height: undefined }]}
            >
              <View style={styles.miniCardHeader}>
                <View style={styles.miniCardLogo}>
                  <Text style={styles.miniCardLogoText}>MP</Text>
                </View>
                <Text style={styles.miniCardDigits}>···· {MOCK_TOP_CARD.last4}</Text>
              </View>
              <View>
                <Text style={styles.miniCardName}>{MOCK_TOP_CARD.name}</Text>
                <Text style={styles.miniCardType}>{MOCK_TOP_CARD.type}</Text>
              </View>
            </LinearGradient>

            <View style={{ flex: 1, gap: 3, paddingRight: 14, paddingVertical: 14 }}>
              <Text style={styles.cardHeading}>Cartão + usado</Text>
              <Text style={styles.cardSublabel}>nesse mês</Text>
              <View style={styles.amountLine}>
                <Text style={styles.amountMd}>{formatBRL(MOCK_TOP_CARD.total)}</Text>
                <Text style={styles.tagGreen}>{MOCK_TOP_CARD.variation}%</Text>
              </View>
              <Text style={styles.cardSublabel}>{MOCK_TOP_CARD.purchases} compras</Text>
            </View>
          </View>

          {/* Pagamentos próximos + Plano */}
          <View style={styles.gridRow}>
            <View style={[styles.card, { flex: 1, gap: 8 }]}>
              <Text style={styles.upcomingTitle}>Tá chegando!</Text>
              <Text style={styles.cardSublabel}>Contas próximas</Text>
              {MOCK_PAYMENTS.map((item, i) => (
                <View key={i} style={styles.payRow}>
                  <View style={styles.payLeft}>
                    <FontAwesome
                      name={item.icon as any}
                      size={12}
                      color={theme.colors.textSecondary}
                      style={{ width: 14 }}
                    />
                    <Text style={styles.payLabel} numberOfLines={1}>{item.label}</Text>
                  </View>
                  <Text
                    style={[
                      styles.payDate,
                      item.status === "urgent"  && { color: "#F97316" },
                      item.status === "warning" && { color: "#FACC15" },
                    ]}
                  >
                    {item.dueLabel}
                  </Text>
                </View>
              ))}
            </View>

            <View style={[styles.card, styles.planCard]}>
              <Ionicons name="pricetag-outline" size={32} color={theme.colors.text} />
              <Text style={styles.planName}>{USER.plan}</Text>
              <Text style={styles.cardSublabel}>Meu plano</Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 28, fontWeight: "700", color: theme.colors.text },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  editBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  editBtnText: { color: theme.colors.text, fontSize: 14, fontWeight: "500" },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 0.5, borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center", justifyContent: "center",
  },

  // Avatar
  avatarSection: { alignItems: "center", paddingTop: 20 },
  pillsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 66,
    marginTop: -26,
  },
  statPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 10, paddingVertical: 8,
    borderRadius: 16, borderWidth: 1,
  },
  pillIncome:  { backgroundColor: "rgba(34,197,94,0.1)",  borderColor: "rgba(34,197,94,0.3)" },
  pillExpense: { backgroundColor: "rgba(244,63,94,0.1)",  borderColor: "rgba(244,63,94,0.3)" },
  pillIconWrap: { width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  pillText: { fontSize: 12, fontWeight: "600", color: theme.colors.text },
  avatarBorder: {
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 3, borderColor: theme.colors.primary, overflow: "hidden",
  },
  avatarCircle: { flex: 1, backgroundColor: "#2D1B69", alignItems: "center", justifyContent: "center" },
  avatarInitials: { fontSize: 40, fontWeight: "700", color: theme.colors.text },

  // User info
  userInfo: {
    alignItems: "center", paddingHorizontal: 20,
    marginTop: 14, gap: 4, marginBottom: 20,
  },
  userName: { fontSize: 30, fontWeight: "800", color: theme.colors.text },
  userMeta: { fontSize: 13, color: theme.colors.textSecondary },
  userMetaBold: { fontWeight: "700", color: theme.colors.text },

  // Tab row
  tabRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, gap: 12, marginBottom: 12,
  },
  tabText: { fontSize: 13, color: theme.colors.textSecondary, fontWeight: "500" },
  tabActive: { color: theme.colors.text, fontWeight: "600" },
  tabLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.1)" },

  // Month selector
  monthSelectorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  monthArrow: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 0.5, borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center", justifyContent: "center",
  },
  monthArrowDisabled: { opacity: 0.3 },
  monthLabelWrap: { flex: 1, alignItems: "center", overflow: "hidden" },
  monthSelectorLabel: {
    fontSize: 15, fontWeight: "700", color: theme.colors.text,
    textTransform: "capitalize",
  },

  // Grid
  grid: { paddingHorizontal: 16, gap: 12, marginBottom: 80 },
  gridRow: { flexDirection: "row", gap: 12 },

  // Card base
  card: { backgroundColor: theme.colors.surface, borderRadius: 22, padding: 16 },

  // Chart card
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  variationBadge: { alignItems: "flex-end", gap: 2 },
  variationText: { fontSize: 15, fontWeight: "700" },
  variationSub: { fontSize: 11, color: theme.colors.textSecondary },
  chartWrap: {
    alignItems: "flex-end",
    gap: BAR_GAP,
    marginTop: 4,
  },
  chartCol: { alignItems: "center", gap: 5 },
  chartValLabel: {
    fontSize: 9, fontWeight: "700", color: "#A855F7",
    textAlign: "center",
  },
  chartBarWrap: { width: "100%", justifyContent: "flex-end", alignItems: "center" },
  chartBar: { width: "100%", borderRadius: 6, minHeight: 6 },
  chartMonthLabel: { fontSize: 11, color: theme.colors.textSecondary, fontWeight: "500" },
  chartMonthLabelActive: { color: "#fff", fontWeight: "700" },

  // Gastos card
  cardHeading: { fontSize: 20, fontWeight: "700", color: theme.colors.text },
  cardSublabel: { fontSize: 15, color: theme.colors.textSecondary },
  amountLine: {
    flexDirection: "row", alignItems: "baseline",
    gap: 5, marginTop: 8, marginBottom: 4, flexWrap: "wrap",
  },
  amountSm: { fontSize: 20, fontWeight: "700", color: theme.colors.text },
  amountMd: { fontSize: 20, fontWeight: "700", color: theme.colors.text },
  tagVariation: { fontSize: 13, fontWeight: "600" },
  tagGreen: { fontSize: 13, fontWeight: "600", color: "#22C55E" },
  bars: { flexDirection: "row", gap: 4, marginTop: 10, height: 7 },
  bar: { flex: 1, borderRadius: 4 },

  // Categoria mais gasta
  catName: { fontSize: 20, fontWeight: "800", color: "#fff" },
  catSublabel: { fontSize: 15, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  catIconWrap: { position: "absolute", left: 0, right: 0, bottom: 0, alignItems: "center" },
  catCount: { fontSize: 15, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  catAmount: { fontSize: 20, fontWeight: "800", color: "#fff", marginTop: 2 },

  // Mini card
  miniCard: {
    width: 140, borderRadius: 14, padding: 12, justifyContent: "space-between",
  },
  miniCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  miniCardLogo: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center", justifyContent: "center",
  },
  miniCardLogoText: { fontSize: 9, color: "#fff", fontWeight: "800" },
  miniCardDigits: { fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: "600" },
  miniCardName: { fontSize: 15, fontWeight: "700", color: "#fff" },
  miniCardType: { fontSize: 13, color: "rgba(255,255,255,0.7)" },

  // Upcoming
  upcomingTitle: { fontSize: 20, fontWeight: "700", color: theme.colors.text },
  payRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  payLeft: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  payLabel: { fontSize: 13, color: theme.colors.text, flex: 1 },
  payDate: { fontSize: 13, color: theme.colors.textSecondary, fontWeight: "500" },

  // Plan card
  planCard: {
    flex: 1, aspectRatio: 1, alignSelf: "flex-start",
    backgroundColor: "#1F2937", justifyContent: "flex-end", gap: 4,
  },
  planName: { fontSize: 22, fontWeight: "800", color: theme.colors.text, marginTop: 8 },
});

export default profile;
