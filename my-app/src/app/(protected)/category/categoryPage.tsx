import CardCategory from "@/components/CardCategory";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/empty-state";
import FloatingButton from "@/components/FloatingButton";
import Screen from "@/components/Screen";
import { SearchBar } from "@/components/search-bar/SearchBar";
import { Shimmer } from "@/components/shimmer/Shimmer";
import { useCategory } from "@/contexts/categoryContext";
import { useTransactions } from "@/contexts/transactionContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ── Mock data (remover quando houver dados reais) ─────────────────────────────

const MOCK_CATEGORIES = [
  { id: "1", name: "Alimentação",  icon: "cutlery"      as const, color: "#F97316", type: "default"  as const },
  { id: "2", name: "Transporte",   icon: "car"          as const, color: "#3B82F6", type: "default"  as const },
  { id: "3", name: "Lazer",        icon: "gamepad"      as const, color: "#A855F7", type: "custom"   as const },
  { id: "4", name: "Saúde",        icon: "heartbeat"    as const, color: "#EF4444", type: "default"  as const },
  { id: "5", name: "Educação",     icon: "book"         as const, color: "#10B981", type: "custom"   as const },
  { id: "6", name: "Casa",         icon: "home"         as const, color: "#F59E0B", type: "custom"   as const },
  { id: "7", name: "Roupas",       icon: "shopping-bag" as const, color: "#EC4899", type: "custom"   as const },
  { id: "8", name: "Academia",     icon: "bicycle"      as const, color: "#06B6D4", type: "custom"   as const },
  { id: "9", name: "Assinaturas",  icon: "credit-card"  as const, color: "#8B5CF6", type: "custom"   as const },
];

const MOCK_SPEND: Record<string, { total: number; count: number }> = {
  "1": { total: 1240.50, count: 18 },
  "2": { total: 680.00,  count: 12 },
  "3": { total: 450.90,  count:  7 },
  "4": { total: 320.00,  count:  4 },
  "5": { total: 250.00,  count:  3 },
  "6": { total: 180.00,  count:  5 },
  "7": { total: 95.00,   count:  2 },
  "8": { total: 60.00,   count:  1 },
  "9": { total: 0,       count:  0 },
};

// ─────────────────────────────────────────────────────────────────────────────

export default function CategoryPage() {
  const router = useRouter();
  const { categories: realCategories } = useCategory();
  const { transactions } = useTransactions();

  const categories = realCategories ?? [];
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const theme = useAppTheme();
  const styles = createStyles(theme);

  useEffect(() => {
    if (realCategories !== undefined) { setIsLoading(false); return; }
    const t = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(t);
  }, [realCategories]);

  // ── Per-category spend totals ─────────────────────────────────────────────

  const spendByCategory = useMemo(() => {
    const real = transactions ?? [];
    const map: Record<string, { total: number; count: number }> = {};
    for (const t of real) {
      if (t.type !== "EXPENSE") continue;
      const key = String(t.categoryId ?? "__none__");
      if (!map[key]) map[key] = { total: 0, count: 0 };
      map[key].total += Number(t.amount);
      map[key].count += 1;
    }
    return map;
  }, [transactions]);

  const totalExpense = useMemo(
    () => Object.values(spendByCategory).reduce((s, e) => s + e.total, 0),
    [spendByCategory]
  );

  const rankedCategories = useMemo(() => {
    return (categories ?? [])
      .map(c => ({
        ...c,
        total: spendByCategory[String(c.id)]?.total ?? 0,
        count: spendByCategory[String(c.id)]?.count ?? 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [categories, spendByCategory]);

  const top3 = rankedCategories.slice(0, 3).filter(c => c.total > 0);

  const rankMap = useMemo(() => {
    const map: Record<string, number> = {};
    rankedCategories.forEach((c, i) => { if (c.total > 0) map[String(c.id)] = i + 1; });
    return map;
  }, [rankedCategories]);

  // ── Summary stats ─────────────────────────────────────────────────────────

  const activeCount = rankedCategories.filter(c => c.total > 0).length;
  const totalCount  = (categories ?? []).length;

  const avgPerActive = activeCount > 0 ? totalExpense / activeCount : 0;

  const topCatName = top3[0]?.name ?? "—";

  // ── Search ────────────────────────────────────────────────────────────────

  const normalizeText = (t: string) =>
    t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!search) return rankedCategories;
    return rankedCategories.filter(c => normalizeText(c.name).includes(normalizeText(search)));
  }, [search, rankedCategories]);

  const MEDAL = ["🥇", "🥈", "🥉"];

  // ── List header ───────────────────────────────────────────────────────────

  const ListHeader = (
    <>
      {/* Header row */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Minhas Categorias</Text>
          <Text style={styles.heroTitle}>Categorias</Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <SearchBar
          tint={theme.colors.textSecondary}
          placeholder="Pesquisar categorias..."
          onSearch={setSearch}
          onClear={() => setSearch("")}
          onSearchDone={() => setSearch("")}
        />
      </View>

      {/* Summary strip */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue} numberOfLines={1}>{topCatName}</Text>
          <Text style={styles.summaryLabel}>Categoria top</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{formatBRL(avgPerActive)}</Text>
          <Text style={styles.summaryLabel}>Média/ativa</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{activeCount}<Text style={styles.summaryValueSub}>/{totalCount}</Text></Text>
          <Text style={styles.summaryLabel}>Ativas</Text>
        </View>
      </View>

      {/* Ranking top 3 */}
      {top3.length > 0 && !search && (
        <View style={styles.rankSection}>
          <Text style={styles.sectionTitle}>Mais utilizadas</Text>
          {top3.map((cat, i) => {
            const pct = totalExpense > 0 ? (cat.total / totalExpense) * 100 : 0;
            const relPct = top3[0].total > 0 ? (cat.total / top3[0].total) * 100 : 0;
            return (
              <TouchableOpacity
                key={cat.id}
                style={styles.rankRow}
                onPress={() => router.push({ pathname: "/category/categoryDetail", params: { id: cat.id } })}
                activeOpacity={0.75}
              >
                <Text style={styles.rankMedal}>{MEDAL[i]}</Text>

                <View style={[styles.rankIcon, { backgroundColor: cat.color + "25" }]}>
                  <FontAwesome name={cat.icon as any} size={18} color={cat.color} />
                </View>

                <View style={styles.rankBody}>
                  <View style={styles.rankTopRow}>
                    <Text style={styles.rankName}>{cat.name}</Text>
                    <Text style={styles.rankAmount}>{formatBRL(cat.total)}</Text>
                  </View>
                  <View style={styles.rankBarTrack}>
                    <View
                      style={[
                        styles.rankBarFill,
                        { width: `${relPct}%` as any, backgroundColor: cat.color },
                      ]}
                    />
                  </View>
                  <Text style={styles.rankMeta}>
                    {cat.count} {cat.count === 1 ? "transação" : "transações"} · {pct.toFixed(0)}% do total
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* All categories header */}
      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>
          {search ? `Resultados para "${search}"` : "Todas"}
        </Text>
      </View>
    </>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  const skeletonData = Array.from({ length: 8 }).map((_, i) => i);

  return (
    <Screen style={{ padding: 0 }}>
      {isLoading ? (
        <>
          {ListHeader}
          <View style={styles.skeletonList}>
            {skeletonData.map(i => (
              <Shimmer key={i} style={styles.categorySkeleton} />
            ))}
          </View>
        </>
      ) : (
        <FlatList
          data={filteredCategories}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardWrap}>
              <CardCategory
                item={item}
                totalAmount={spendByCategory[String(item.id)]?.total ?? 0}
                txCount={spendByCategory[String(item.id)]?.count ?? 0}
                totalExpense={totalExpense}
                rank={rankMap[String(item.id)]}
              />
            </View>
          )}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon" style={{ backgroundColor: theme.colors.surface }}>
                    {Platform.OS === "ios" ? (
                      <SymbolView name="square.grid.2x2" size={60} tintColor={theme.colors.text} />
                    ) : (
                      <Ionicons name="grid-outline" size={60} color={theme.colors.text} />
                    )}
                  </EmptyMedia>
                  <EmptyTitle>
                    {search ? `Nenhuma categoria para "${search}"` : "Nenhuma categoria cadastrada"}
                  </EmptyTitle>
                  <EmptyDescription>
                    {search ? "Tente outros termos" : "Crie sua primeira categoria clicando no botão abaixo"}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </View>
          }
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FloatingButton
        style={styles.fab}
        onPress={() => router.push("/category/createCategory")}
      />
    </Screen>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 16,
      paddingHorizontal: 20,
      paddingTop: 64,
      paddingBottom: 4,
    },

    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.colors.glass + "5",
      borderWidth: 0.5,
      borderColor: theme.colors.glass,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 4,
    },

    hero: {
      flex: 1,
      gap: 2,
    },

    heroLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: theme.colors.primary,
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },

    heroTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.colors.text,
    },

    searchWrap: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 4,
    },

    summaryRow: {
      flexDirection: "row",
      marginHorizontal: 20,
      marginTop: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 18,
      borderWidth: 0.5,
      borderColor: "rgba(255,255,255,0.08)",
      overflow: "hidden",
    },

    summaryItem: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 14,
      gap: 4,
    },

    summaryDivider: {
      width: 0.5,
      backgroundColor: "rgba(255,255,255,0.08)",
      alignSelf: "stretch",
      marginVertical: 10,
    },

    summaryValue: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.text,
    },

    summaryValueSub: {
      fontSize: 12,
      fontWeight: "500",
      color: theme.colors.textSecondary,
    },

    summaryLabel: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    rankSection: {
      marginTop: 28,
      paddingHorizontal: 20,
      gap: 10,
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 4,
    },

    rankRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: "rgba(255,255,255,0.07)",
      padding: 14,
    },

    rankMedal: {
      fontSize: 20,
      width: 28,
      textAlign: "center",
    },

    rankIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },

    rankBody: {
      flex: 1,
      gap: 6,
    },

    rankTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    rankName: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.text,
    },

    rankAmount: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.text,
    },

    rankBarTrack: {
      height: 4,
      backgroundColor: "rgba(255,255,255,0.08)",
      borderRadius: 2,
      overflow: "hidden",
    },

    rankBarFill: {
      height: 4,
      borderRadius: 2,
    },

    rankMeta: {
      fontSize: 11,
      color: theme.colors.textSecondary,
    },

    listHeader: {
      paddingHorizontal: 20,
      paddingTop: 28,
      paddingBottom: 4,
    },

    cardWrap: {
      paddingHorizontal: 20,
      marginBottom: 10,
    },

    content: {
      paddingBottom: 120,
    },

    skeletonList: {
      paddingHorizontal: 20,
      paddingTop: 8,
      gap: 10,
    },

    categorySkeleton: {
      height: 72,
      borderRadius: 18,
    },

    emptyWrap: {
      paddingTop: 20,
    },

    fab: {
      bottom: 32,
      right: 20,
    },
  });
