import theme from "@/app/themes/theme";
import Arrow from "@/assets/images/Arrow.svg";
import CardTransaction from "@/components/CardTransaction";
import { ChipGroup } from "@/components/chip-group/Chip";
import { SCREEN_WIDTH } from "@/components/const";
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
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { SafeAreaView } from "react-native-safe-area-context";

function TransactionPage() {
  const router = useRouter();
  const { transactions } = useTransactions();
  const { categories } = useCategory();

  const { type } = useLocalSearchParams();
  const activeType = type ?? "all";
  const [search, setSearch] = useState<string>("");

  const chips = [
    { key: "all", label: "Todas", icon: () => <Ionicons name="list" size={18} color="white" />, activeColor: theme.colors.primary },
    { key: "INCOME", label: "Entradas", icon: () => <Ionicons name="arrow-up" size={18} color="white" />, activeColor: theme.colors.secondary },
    { key: "EXPENSE", label: "Saídas", icon: () => <Ionicons name="arrow-down" size={18} color="white" />, activeColor: "#F44336" },
    { key: "TRANSFER", label: "Transferência", icon: () => <Ionicons name="swap-vertical" size={18} color="white" />, activeColor: "#FF9800" },
  ];

  const normalizeText = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  
  const filteredTransactions = useMemo(() => {
    return (transactions ?? [])
      .filter((item) => {
        if (activeType === "all") return true;
        return item.type === activeType;
      })
      .filter((item) => {
        if (!search) return true;

        const categoryName =
          categories?.find((cat) => cat.id === item.categoryId)?.name || "";

        const searchableText = `
          ${item.description ?? ""}
          ${item.amount}
          ${categoryName}
        `;

        const normalizedItem = normalizeText(searchableText);
        const normalizedSearch = normalizeText(search);

        return normalizedItem.includes(normalizedSearch);
      })
      .sort(
        (a, b) =>
          new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime()
      );
  }, [transactions, activeType, search, categories]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (transactions !== undefined) {
      setIsLoading(false);
      return;
    }
    const timeout = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timeout);
  },[transactions]);

  return (
    <Screen>
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
            <Text style={styles.heroLabel}>Minhas transações</Text>
            <Text style={styles.heroTitle}>Histórico</Text>
            <Text style={styles.heroSub}>Veja e filtre suas transações</Text>
          </View>

          <View style={styles.chipWrapper}>
            <ChipGroup
              chips={chips}
              selectedIndex={chips.findIndex((item) => item.key === activeType)}
              onChange={(index) => {
                const selectedKey = chips[index].key;

                router.setParams({ type: selectedKey === "all" ? undefined : selectedKey });
              }}
            />
          </View>

          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Shimmer key={index} style={styles.transactionSkeleton}/>
            ))
          ) : (
          filteredTransactions.length === 0 ? (
            <SafeAreaView style={styles.container}>
              <Empty>
                <EmptyHeader>
                  <EmptyMedia
                    variant="icon"
                    style={{ backgroundColor: theme.colors.surface }}
                  >
                    {Platform.OS === "ios" ? (
                      <SymbolView
                        name="arrow.up.arrow.down"
                        size={60}
                        tintColor="#fff"
                      />
                    ) : (
                      <Ionicons name="swap-vertical" size={60} color="#fff" />
                    )}
                  </EmptyMedia>

                  <EmptyTitle>{search ? `Nenhuma resultado para "${search}"` : `Nenhuma transação ${activeType === "all" ? `(${activeType})` : "" }`}</EmptyTitle>

                  <View style={styles.emptyContent}>
                    <EmptyDescription>
                      {search ? "Nenhuma transação encontrada" : "Que tal começar criando uma transação"}
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
              data={filteredTransactions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <CardTransaction item={item} />}
              contentContainerStyle={{ gap: 12, paddingTop: 8, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
            />
          ))}
        </View>

      <FloatingButton
        style={styles.fab}
        onPress={() => router.push("/transaction/createTransaction")}
      />

    </Screen>
  );
}

export default TransactionPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },

  header: {
    paddingTop: 56,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
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

  emptyContent: {
    position: "absolute",
    bottom: -320,
    left: 0,
    gap: 15,
    alignItems: "center",
  },

  transactionSkeleton: {
    width: "100%",
    height: 80,
    borderRadius: 12,
  },

  chipWrapper: {
    marginTop: 8,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    padding: 25,

  },
});
