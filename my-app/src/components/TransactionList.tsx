import { View, Text, StyleSheet } from "react-native";
import theme from "@/app/themes/theme";
import TransactionItem from "./TransactionItem";
import Transaction from "@/types/transaction";

type Props = {
  transactions: Transaction[];
};

export default function TransactionList({ transactions }: Props) {
  return (
    <View style={styles.container}>
      {transactions.map((t) => (
        <TransactionItem key={t.id} item={t} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
  },

  empty: {
    marginTop: 60,
    alignItems: "center",
  },

  emptyText: {
    color: theme.colors.textSecondary,
  },
});