import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/empty-state";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";
import theme from "@/app/themes/theme";
import Screen from "@/components/Screen";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";
import Arrow from "@/assets/images/Arrow.svg";
import { useWallets } from "@/contexts/walletContext";
import CardWallet from "@/components/CardWallet";
import FloatingButton from "@/components/FloatingButton";
import { useEffect, useMemo, useState } from "react";
import { SearchBar } from "@/components/search-bar/SearchBar";
import { Shimmer, ShimmerGroup } from "@/components/shimmer/Shimmer";
import CardInsights from "@/components/CardInsights";
import { useBalance } from "@/hooks/useBalance";

function walletPage() {
  const router = useRouter();
  const { wallets } = useWallets();
  const [search, setSearch] = useState<string>("");
  const { formattedBalance } = useBalance();

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
          Array.from({ length: 3 }).map((_, index) => (
            <Shimmer key={index} style={styles.walletSkeleton} />
          ))
        ) : filteredWallets.length === 0 ? (
          <SafeAreaView style={[styles.container, {marginTop: -90}]}>
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
                      tintColor="#fff"
                    />
                  ) : (
                    <Ionicons name="wallet-outline" size={60} color="#fff" />
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
          <View style={styles.walletsContainer}>
            <Text style={styles.walletsLabel}>Minhas carteiras</Text>
            <FlatList
              data={filteredWallets}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <CardWallet item={item} />}
              contentContainerStyle={{
                gap: 12,
                paddingTop: 8,
                paddingBottom: 100,
              }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </View>
      <FloatingButton
        style={styles.fab}
        onPress={() => router.push("/wallet/createWallet")}
      />
    </Screen>
  );
}

export default walletPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    lineHeight: 18,
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

  walletsContainer: {
    flex: 1,
    gap: 12,
  },

  walletsLabel: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
  },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    padding: 25,
  },
});
