import CardCategory from "@/components/CardCategory";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/empty-state";
import FloatingButton from "@/components/FloatingButton";
import Screen from "@/components/Screen";
import { SearchBar } from "@/components/search-bar/SearchBar";
import { Shimmer, ShimmerGroup } from "@/components/shimmer/Shimmer";
import { useCategory } from "@/contexts/categoryContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import Category from "@/types/category";
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

function categoryPage() {
  const router = useRouter();
  const { categories } = useCategory();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const normalizeText = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .toLowerCase();

  const filteredCategories = useMemo(() => {
  return (categories ?? []).filter((item) => {
    if (!search) return true;

    const normalizedItem = normalizeText(item.name);
    const normalizedSearch = normalizeText(search);

    return normalizedItem.includes(normalizedSearch);
  });
}, [search, categories]);


  useEffect(() => {
    if (categories !== undefined) {
      setIsLoading(false);
      return;
    }
    const timeout = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timeout);
  }, [categories]);

  const data: (Category | null)[] = isLoading
  ? Array.from({ length: 6 }).map(() => null)
  : filteredCategories;

  return (
    <Screen>
      <ShimmerGroup
        isLoading={isLoading}
        preset="dark"
        duration={1000}
        direction="leftToRight"
      >
        <FlatList<Category | null>
          data={data}
          keyExtractor={(item, index) =>
            item === null ? index.toString() : item.id
          }
          renderItem={({ item }) =>
            item === null ? (
              <Shimmer style={styles.categorySkeleton} />
            ) : (
              <CardCategory item={item} />
            )
          }
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}

          ListHeaderComponent={
            <>
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
                  style={{flex: 1, minWidth: 0}}
                  cancelButtonWidth={80}
                />
              </View>

              <View style={styles.hero}>
                <Text style={styles.heroLabel}>
                  Minhas Categorias
                </Text>
                <Text style={styles.heroTitle}>
                  Toque em uma categoria para ver suas transações
                </Text>
                <Text style={styles.heroSub}>
                  Ou crie novas categorias
                </Text>
              </View>
            </>
          }

          ListEmptyComponent={
            <View>
              <Empty>
                <EmptyHeader>
                  <EmptyMedia
                    variant="icon"
                    style={{ backgroundColor: theme.colors.surface }}
                  >
                    {Platform.OS === "ios" ? (
                      <SymbolView
                        name="square.grid.2x2"
                        size={60}
                        tintColor={theme.colors.text}
                      />
                    ) : (
                      <Ionicons
                        name="grid-outline"
                        size={60}
                        color={theme.colors.text}
                      />
                    )}
                  </EmptyMedia>
              <EmptyTitle>{search ? `Nenhuma categoria encontrada para "${search}"` : "Nenhuma categoria cadastrada"}</EmptyTitle>
              <EmptyDescription>Para criar uma meta, clique no botão abaixo.</EmptyDescription>
              </EmptyHeader>
              </Empty>
            </View>
          }
        />
      </ShimmerGroup>

      <FloatingButton
        style={styles.fab}
        onPress={() => router.push("/category/createCategory")}
      />
    </Screen>
  );
}

export default categoryPage;

const createStyles = (theme: ReturnType<typeof useAppTheme>) => 
StyleSheet.create({
  content: {
    paddingTop: 56,
    paddingBottom: 120,
    gap: 16,
  },

  header: {
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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

  hero: {
    marginBottom: 24,
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
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    lineHeight: 30,
  },

  heroSub: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 6,
  },

  row: {
    justifyContent: "space-between",
    gap: 12,
  },

  categorySkeleton: {
    flex: 1,
    height: 130,
    borderRadius: 20,
  },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    padding: 25,

  },
});