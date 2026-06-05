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
      const searchableText = `${item.name ?? ""} ${item.type ?? ""}`.toLowerCase();
      const normalizedItem = normalizeText(searchableText);
      return normalizedItem.includes(normalizeText(search));
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
  const totalCount = (wallets ?? []).length;
  const insights = useMemo(() => {
  const checking = (wallets ?? [])
    .filter(w => w.type === "CHECKING_ACCOUNT")
    .reduce((acc, w) => acc + Number(w.balance), 0);

  const savings = (wallets ?? [])
    .filter(w => w.type === "SAVINGS_ACCOUNT")
    .reduce((acc, w) => acc + Number(w.balance), 0);

  const goals = (wallets ?? [])
    .filter(w => w.type === "GOAL")
    .reduce((acc, w) => acc + Number(w.balance), 0);

  const format = (value: number) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return {
    checking: format(checking),
    savings: format(savings),
    goals: format(goals),
  };
}, [wallets]);

  // Card azul com saldo total e breakdown por tipo de carteira
  const balanceSummaryCard = (
  <View style={styles.balanceCard}>
    <View style={styles.balanceCardTop}>
      <View>
        <Text style={styles.balanceCardLabel}>Saldo total</Text>

        <Text style={styles.balanceCardValue}>
          {formattedBalance ?? "R$ 0,00"}
        </Text>
      </View>

      <View style={styles.walletCountBadge}>
        <Text style={styles.walletCountBadgeText}>
          {totalCount} {totalCount === 1 ? "carteira" : "carteiras"}
        </Text>
      </View>
    </View>

    <View style={styles.insightsRow}>
      <CardInsights
        title="Corrente"
        subtitle={insights.checking}
        icon={
          <Ionicons
            name="card-outline"
            size={18}
            color={theme.colors.info}
          />
        }
      />

      <CardInsights
        title="Poupança"
        subtitle={insights.savings}
        icon={
          <Ionicons
            name="shield-checkmark-outline"
            size={18}
            color={theme.colors.secondary}
          />
        }
        variant="success"
      />

      <CardInsights
        title="Caixinhas"
        subtitle={insights.goals}
        icon={
          <Ionicons
            name="archive-outline"
            size={18}
            color="#F59E0B"
          />
        }
      />
    </View>
  </View>
);

  const listHeader = (
    <>
      {/* Header com botão voltar + busca */}
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

      {/* Hero com borda lateral azul */}
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Minhas Carteiras</Text>
        <Text style={styles.heroTitle}>Seu patrimônio</Text>
        <Text style={styles.heroSub}>
          {totalCount > 0
            ? `${totalCount} ${totalCount === 1 ? "carteira ativa" : "carteiras ativas"}`
            : "Crie e gerencie suas carteiras"}
        </Text>
      </View>

      {/* Card de saldo total — sempre visível */}
      {!isLoading && (wallets ?? []).length > 0 && balanceSummaryCard}

      {/* Skeletons / Empty / Label da seção */}
      {isLoading ? (
        <View style={{ gap: 10 }}>
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
                  <Ionicons
                    name="wallet-outline"
                    size={60}
                    color={theme.colors.text}
                  />
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
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>
            {search
              ? `${count} ${count === 1 ? "resultado" : "resultados"}`
              : "Suas carteiras e caixinhas"}
          </Text>
        </View>
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
      paddingBottom: 140,
      gap: 16,
    },
    header: {
      paddingTop: 56,
      paddingBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    // Hero com borda lateral esquerda azul
    hero: {
      paddingVertical: 5,
      paddingLeft: 14,
      borderLeftWidth: 2,
      borderLeftColor: theme.colors.info ?? "#185FA5",
    },
    heroLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: theme.colors.info ?? "#185FA5",
      letterSpacing: 1.4,
      textTransform: "uppercase",
      marginBottom: 6,
    },
    heroTitle: {
      fontSize: 26,
      fontWeight: "700",
      color: theme.colors.text,
      lineHeight: 32,
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
      backgroundColor: theme.colors.glass + "10",
      borderWidth: 0.5,
      borderColor: theme.colors.glass,
      alignItems: "center",
      justifyContent: "center",
    },
    balanceCard: {
      backgroundColor: (theme.colors.info ?? "#185FA5") + "18",
      borderRadius: 16,
      padding: 16,
      marginTop: 12
    },
    balanceCardTop: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    balanceCardLabel: {
      fontSize: 12,
      color: theme.colors.info ?? "#185FA5",
      fontWeight: "500",
      marginBottom: 4,
    },
    balanceCardValue: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.colors.text,
      lineHeight: 34,
    },
    walletCountBadge: {
      backgroundColor: theme.colors.info ?? "#185FA5",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    walletCountBadgeText: {
      fontSize: 12,
      color: "#fff",
      fontWeight: "500",
    },
    insightsRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 16,
    },
    sectionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 4,
    },
    sectionLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.text,
    },
    walletSkeleton: {
      width: "100%",
      height: 100,
      borderRadius: 14,
    },
    fab: {
      bottom: 110,
      right: 20,
    },
  });