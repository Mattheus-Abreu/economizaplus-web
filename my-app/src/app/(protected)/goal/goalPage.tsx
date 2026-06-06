import { GRADIENTS } from "@/components/CardHome";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/empty-state";
import FloatingButton from "@/components/FloatingButton";
import GoalCard from "@/components/GoalCard";
import Screen from "@/components/Screen";
import { SearchBar } from "@/components/search-bar/SearchBar";
import { Shimmer, ShimmerGroup } from "@/components/shimmer/Shimmer";
import { useGoals } from "@/contexts/goalContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useMemo, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

function goalPage() {
  const router = useRouter();
  const { goals } = useGoals();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const normalizeText = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const filteredGoals = useMemo(() => {
    return (goals ?? []).filter((item) => {
      if (!search) return true;
      return normalizeText(item.name).includes(normalizeText(search));
    });
  }, [search, goals]);

  const totalSaved = useMemo(() => {
    return (goals ?? []).reduce((sum, g) => sum + Number(g.currentAmount ?? 0), 0);
  }, [goals]);

  const totalTarget = useMemo(() => {
    return (goals ?? []).reduce((sum, g) => sum + Number(g.targetAmount ?? 0), 0);
  }, [goals]);

  const completedGoals = useMemo(() => {
    return (goals ?? []).filter(
      (g) => Number(g.currentAmount) >= Number(g.targetAmount)
    ).length;
  }, [goals]);

  const overallProgress = totalTarget > 0
    ? Math.min(Math.round((totalSaved / totalTarget) * 100), 100)
    : 0;

  useEffect(() => {
    if (goals !== undefined) {
      setIsLoading(false);
      return;
    }
    const timeout = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timeout);
  }, [goals]);

  const listHeader = (
    <>
      {/* Stats row — visível apenas quando há metas */}
      {!isLoading && filteredGoals.length > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "rgba(168,85,247,0.12)" }]}>
              <Ionicons name="wallet-outline" size={16} color="#A855F7" />
            </View>
            <Text style={styles.statLabel}>Total guardado</Text>
            <Text style={styles.statValue}>
              {totalSaved.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 0,
              })}
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "rgba(34,197,94,0.12)" }]}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#22C55E" />
            </View>
            <Text style={styles.statLabel}>Concluídas</Text>
            <Text style={[styles.statValue, completedGoals > 0 && { color: "#22C55E" }]}>
              {completedGoals} / {(goals ?? []).length}
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "rgba(99,179,237,0.12)" }]}>
              <Ionicons name="trending-up-outline" size={16} color="#63B3ED" />
            </View>
            <Text style={styles.statLabel}>Progresso</Text>
            <Text style={styles.statValue}>{overallProgress}%</Text>
          </View>
        </View>
      )}

      {/* Shimmer skeletons */}
      {isLoading && (
        <View style={{ gap: 12 }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Shimmer key={index} style={styles.goalSkeleton} />
          ))}
        </View>
      )}

      {/* Empty state */}
      {!isLoading && filteredGoals.length === 0 && (
        <SafeAreaView style={[styles.container, { marginTop: -40 }]}>
          <Empty>
            <EmptyHeader>
              <EmptyMedia
                variant="icon"
                style={{ backgroundColor: theme.colors.surface }}
              >
                {Platform.OS === "ios" ? (
                  <SymbolView
                    name="target"
                    size={60}
                    tintColor={theme.colors.text}
                  />
                ) : (
                  <Ionicons
                    name="trending-up-outline"
                    size={60}
                    color={theme.colors.text}
                  />
                )}
              </EmptyMedia>
              <EmptyTitle>
                {search
                  ? `Nenhuma meta encontrada para "${search}"`
                  : "Nenhuma meta cadastrada"}
              </EmptyTitle>
              <View
                style={{
                  position: "absolute",
                  bottom: -320,
                  left: 0,
                  gap: 15,
                  alignItems: "center",
                }}
              >
                <EmptyDescription>
                  {search
                    ? `Tente buscar por outro nome`
                    : "Que tal começar criando uma meta"}
                </EmptyDescription>
                
              </View>
            </EmptyHeader>
          </Empty>
        </SafeAreaView>
      )}

      {/* Cabeçalho da lista */}
      {!isLoading && filteredGoals.length > 0 && (
        <View style={styles.listHeader}>
          <Text style={styles.listHeaderTitle}>
            {search ? `Resultados (${filteredGoals.length})` : "Minhas metas"}
          </Text>
        </View>
      )}
    </>
  );

  return (
    <Screen>
      <ShimmerGroup
        isLoading={isLoading}
        preset="dark"
        duration={1000}
        direction="leftToRight"
      >
        <View style={styles.container}>
          {/* Header fixo com busca */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <FontAwesome
                name="arrow-left"
                size={16}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            <SearchBar
              containerWidth={undefined}
              tint={theme.colors.textSecondary}
              placeholder="Pesquisar"
              onSearch={(text) => setSearch(text)}
              onClear={() => setSearch("")}
              onSearchDone={() => setSearch("")}
              style={{ flex: 1 }}
            />
          </View>

          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroLabel}>Minhas metas</Text>
            <Text style={styles.heroTitle}>Metas</Text>
            <Text style={styles.heroSub}>
              Acompanhe e gerencie suas metas de poupança
            </Text>
          </View>

          {/* Lista principal com header embutido */}
          <FlatList
            data={isLoading || filteredGoals.length === 0 ? [] : filteredGoals}
            renderItem={({ item, index }) => (
              <GoalCard
                item={item}
                gradient={GRADIENTS[index % GRADIENTS.length]}
                gradientIndex={index}
              />
            )}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={listHeader}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ShimmerGroup>

      <FloatingButton
        style={styles.fab}
        onPress={() => router.push("/goal/createGoal")}
      />
    </Screen>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingTop: 56,
      paddingBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    hero: {
      paddingTop: 4,
      marginBottom: 20,
    },
    heroLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: theme.colors.primary,
      letterSpacing: 1.4,
      textTransform: "uppercase",
      marginBottom: 8,
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.colors.text,
      lineHeight: 34,
    },
    heroSub: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 6,
      lineHeight: 18,
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
    },

    // Stats row
    statsRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: theme.colors.glass,
      padding: 12,
      gap: 4,
    },
    statIcon: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 6,
    },
    statLabel: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    statValue: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.text,
      marginTop: "auto"
    },

    // Lista
    listHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    listHeaderTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
    },
    listContent: {
      gap: 12,
      paddingBottom: 120,
    },

    goalSkeleton: {
      width: "100%",
      height: 120,
      borderRadius: 20,
    },
    fab: {
      bottom: 32,
      right: 20,
    },
  });

export default goalPage;