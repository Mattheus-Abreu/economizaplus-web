import { useAppTheme } from "@/hooks/useAppTheme";
import Transaction from "@/types/transaction";
import { StyleSheet, View } from "react-native";
import TransactionItem from "./TransactionItem";

type Props = {
  transactions: Transaction[];
};

export default function TransactionList({ transactions }: Props) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {transactions.map((t) => (
        <TransactionItem key={t.id} item={t} />
      ))}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => 
StyleSheet.create({
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