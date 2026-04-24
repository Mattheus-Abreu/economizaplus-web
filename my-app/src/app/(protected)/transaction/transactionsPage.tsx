import theme from "@/app/themes/theme";
import Arrow from "@/assets/images/Arrow.svg";
import CardTransaction from "@/components/CardTransaction";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/empty-state";
import FloatingButton from "@/components/FloatingButton";
import Screen from "@/components/Screen";
import { useTransactions } from "@/contexts/transactionContext";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useMemo } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function TransactionPage() {
  const router = useRouter();
  const { transactions } = useTransactions();

  const { type } = useLocalSearchParams();

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((item) => {
        if (!type) return true;
        return item.type === type;
      })
      .sort(
        (a, b) =>
          new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime(),
      );
  }, [transactions, type]);

  return (
    <Screen style={{ padding: 20 }}>
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, gap: 20 }}>
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

          {filteredTransactions.length === 0 ? (
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

                  <EmptyTitle>Nenhuma transação</EmptyTitle>

                  <View style={styles.emptyContent}>
                    <EmptyDescription>
                      Que tal começar criando uma transação
                    </EmptyDescription>

                    <Arrow
                      width={100}
                      height={60}
                      style={{ transform: [{ rotate: "20deg" }] }}
                    />
                  </View>
                </EmptyHeader>
              </Empty>
            </SafeAreaView>
          ) : (
            <FlatList
              data={filteredTransactions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <CardTransaction item={item} />}
              contentContainerStyle={{ gap: 15, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>

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

export default TransactionPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
    alignItems: "center",
  },

  header: {
    paddingTop: 56,
    paddingBottom: 4,
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

  emptyContent: {
    position: "absolute",
    bottom: -320,
    left: 0,
    gap: 15,
    alignItems: "center",
  },
});
