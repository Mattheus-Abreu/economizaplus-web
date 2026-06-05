import Arrow from "@/assets/images/Arrow.svg";
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
      if(!search) return true;
      
      const normalizedItem = normalizeText(item.name);
      const normalizedSearch = normalizeText(search);

      return normalizedItem.includes(normalizedSearch);
    })
  }, [search, goals]);

  useEffect(() => {
    if (goals !== undefined) {
      setIsLoading(false);
      return;
    }
    const timeout = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timeout);
  }, [goals]);

  return (
    <Screen>
        <ShimmerGroup
          isLoading={isLoading}
          preset="dark"
          duration={1000}
          direction="leftToRight"
        >
            <View style={styles.container}>
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
                  style={{flex: 1}}
                />
              </View>

              <View style={styles.hero}>
                <Text style={styles.heroLabel}>Minhas Metas</Text>
                <Text style={styles.heroTitle}>
                  Toque em uma meta e veja seu progresso
                </Text>
                <Text style={styles.heroSub}>Ou crie novas metas</Text>
              </View>

              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Shimmer key={index} style={styles.goalSkeleton} />
                ))
              ) : filteredGoals.length === 0 ? (
                <SafeAreaView style={styles.container}>
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
                      <EmptyTitle>{search ? `Nenhuma meta encontrada para "${search}"` : "Nenhuma meta cadastrada"}</EmptyTitle>
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
                          {search ? `Nenhuma meta encontrada para "${search}"` : "Que tal começar criando uma meta"}
                        </EmptyDescription>
                        {!search && (
                          <Arrow
                          width={100}
                          height={60}
                          style={{ transform: [{ rotate: "20deg" }] }}
                        />
                        )}
                      </View>
                    </EmptyHeader>
                  </Empty>
                </SafeAreaView>
              ) : (
                <FlatList
                  data={filteredGoals}
                  renderItem={({ item, index }) => (
                    <GoalCard
                      item={item}
                      gradient={GRADIENTS[index % GRADIENTS.length]}
                      gradientIndex={index}
                    />
                  )}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ gap: 12, paddingTop: 8, paddingBottom: 100 }}
                  showsVerticalScrollIndicator={false}
                />
              )}
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
    gap: 16
  },
  header: {
    paddingTop: 56,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  hero: {
    paddingTop: 5,
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
    marginTop: 8,
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
  goalSkeleton: {
    width: "100%",
    height: 120,
    borderRadius: 20,
    marginBottom: 16,
  },
  fab: {
    bottom: 32,
    right: 20,
  },
});

export default goalPage;
