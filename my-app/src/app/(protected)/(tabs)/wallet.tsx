import Arrow from "@/assets/images/Arrow.svg";
import CardInsights from "@/components/CardInsights";
import CardWallet from "@/components/CardWallet";
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
import { useWallets } from "@/contexts/walletContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useBalance } from "@/hooks/useBalance";
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
import { SafeAreaView } from "react-native-safe-area-context";

function walletPage() {
  const router = useRouter();
  const { wallets } = useWallets();
  const [search, setSearch] = useState<string>("");
  const { formattedBalance } = useBalance();
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const normalizeText = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

 const filteredWallets = useMemo(() => {
  return (wallets ?? []).filter((item) => {
    if (!search) return true;

    const searchbleText = `${item.name ?? ""} ${item.type ?? ""}`.toLowerCase();
    const normalizedItem = normalizeText(searchbleText);

    return normalizedItem.includes(normalizeText(search)); // ✅ fixed
  });
}, [search, wallets]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (wallets !== undefined) {
      setIsLoading(false);
      return;
    }
    const timeout = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timeout);
  }, [wallets]);

  const count = filteredWallets.length;

  const listHeader = (
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
          style={{ flex: 1 }}
        />
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Minhas carteiras</Text>
        <Text style={styles.heroTitle}>Carteiras</Text>
        <Text style={styles.heroSub}>Crie e gerencie suas carteiras</Text>
      </View>

      <View style={styles.cardContainer}>
        <CardInsights
          title="Saldo total"
          subtitle={formattedBalance ?? "R$ 0,00"}
          variant="success"
        />
        <CardInsights
          title="Carteiras"
          subtitle={`${count} ${count === 1 ? "ativa" : "ativas"}`}
        />
      </View>

      {isLoading ? (
        <View style={{ gap: 12 }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Shimmer key={index} style={styles.walletSkeleton} />
          ))}
        </View>
      ) : filteredWallets.length === 0 ? (
        <SafeAreaView style={[styles.container, { marginTop: -90 }]}>
          <Empty>
            <EmptyHeader>
              <EmptyMedia
                variant="icon"
                style={{
                  backgroundColor: theme.colors.surface,
                }}
              >
                {Platform.OS === "ios" ? (
                  <SymbolView
                    name="wallet.bifold"
                    size={60}
                    tintColor={theme.colors.text}
                  />
                ) : (
                  <Ionicons name="wallet-outline" size={60} color={theme.colors.text} />
                )}
              </EmptyMedia>
              <EmptyTitle>
                {search
                  ? `Nenhuma carteira encontrada para "${search}"`
                  : "Nenhuma carteira cadastrada"}
              </EmptyTitle>
              <View
                style={{
                  position: "absolute",
                  bottom: -260,
                  right: -70,
                  gap: 15,
                  alignItems: "center",
                }}
              >
                <EmptyDescription>
                  {search
                    ? "Tente buscar outra carteira"
                    : "Que tal começar criando uma carteira"}
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
        <Text style={styles.walletsLabel}>Minhas carteiras</Text>
      )}
    </>
  );

  return (
    <Screen>
      <FlatList
        data={isLoading || filteredWallets.length === 0 ? [] : filteredWallets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CardWallet item={item} />}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      />
      <FloatingButton
        style={styles.fab}
        onPress={() => router.push("/wallet/createWallet")}
      />
    </Screen>
  );
}

export default walletPage;

const createStyles = (theme: ReturnType<typeof useAppTheme>) => 
  StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    gap: 20,
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
    marginBottom: 12,
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

  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 10,
  },

  walletSkeleton: {
    width: "100%",
    height: 100,
    borderRadius: 12,
  },

  walletsLabel: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
  },

  fab: {
    bottom: 110,
    right: 20,
  },
});
