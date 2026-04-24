import theme from "@/app/themes/theme";
import CategoryInsights from "@/components/CategoryInsights";
import FloatingButton from "@/components/FloatingButton";
import Screen from "@/components/Screen";
import TransactionList from "@/components/TransactionList";
import { useCategory } from "@/contexts/categoryContext";
import { useTransactions } from "@/contexts/transactionContext";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

function categoryDetail() {
  const { categories } = useCategory();
  const { transactions } = useTransactions();
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const category = categories.find((c) => c.id === params.id);

  const categoryTransactions = useMemo(() => {
    return transactions
      .filter((t) => String(t.categoryId) === String(category?.id))
      .sort(
        (a, b) =>
          new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime(),
      );
  }, [transactions, category?.id]);

  const totalExpense = categoryTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalTransactions = categoryTransactions.length;

  const average = totalTransactions > 0 ? totalExpense / totalTransactions : 0;

  return (
    <Screen style={{ padding: 0 }}>
      <View style={{ position: "relative" }}>
        <Svg height="300" width="100%" style={{ position: "absolute", top: 0 }}>
          <Defs>
            <RadialGradient id="grad" cx="50%" cy="20%" r="60%">
              <Stop offset="0%" stopColor={category?.color} stopOpacity="0.4" />
              <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="300" fill="url(#grad)" />
        </Svg>

        <View style={styles.hero}>
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
          </View>

          <View style={styles.heroContent}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: category?.color + "30" },
              ]}
            >
              <FontAwesome
                name={category?.icon}
                size={30}
                color={category?.color}
              />
            </View>

            <Text style={styles.heroTitle}>{category?.name}</Text>

            <Text style={styles.heroSub}>{totalTransactions} transações</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardContainer}>
        <CategoryInsights
          title="Total gasto"
          subtitle={totalExpense.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        />
        <CategoryInsights
          title="Transações"
          subtitle={totalTransactions.toString()}
        />
        <CategoryInsights
          title="Média"
          subtitle={average.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        />
      </View>

      <View style={styles.labelContainer}>
        <Text style={styles.heroLabel}>Transações</Text>
      </View>

      {categoryTransactions.length === 0 ? (
        <View style={styles.noTransactionsContainer}>
          <Text style={styles.noTransactionsText}>Nenhuma transação</Text>
        </View>
      ) : (
          <FlatList
            data={categoryTransactions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TransactionList transactions={[item]} />}
            contentContainerStyle={{ gap: 15, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
        />
      )}

      <FloatingButton
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          padding: 25,
        }}
        onPress={() => router.push("/transaction/createTransaction")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 56,
    paddingHorizontal: 24,
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
    paddingBottom: 20,
  },

  heroContent: {
    alignItems: "center",
    marginTop: -40,
  },

  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text,
  },

  heroSub: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },

  heroLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.primary,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 8,
  },

  labelContainer: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },

  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 10,
  },

  listContainer: {
    flex: 1,
  },

  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },

  transactionLeft: {
    flex: 1,
  },

  transactionDescription: {
    fontSize: 15,
    color: theme.colors.text,
  },

  transactionDate: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },

  transactionAmount: {
    fontSize: 15,
    fontWeight: "600",
  },
  emptyList: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginTop: 80,
    textAlign: "center",
  },

  noTransactionsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  noTransactionsText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  }
});

export default categoryDetail;
