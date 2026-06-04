import { useWallets } from "@/contexts/walletContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import Saving from "@/types/savings";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  item: Saving;
};

function SavingList({ item }: Props) {
  const { wallets } = useWallets();
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const safeAmount = Number(item.amount ?? 0);

  const walletName =
    wallets?.find((w) => w.id === item.walletId)?.name ||
    "Carteira não encontrada";

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.wallet}>{walletName}</Text>

        <Text style={styles.amount}>
          + R${" "}
          {safeAmount.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </Text>
      </View>
    </View>
    
  );
}

export default SavingList;

const createStyles = (theme: ReturnType<typeof useAppTheme>) => 
StyleSheet.create({
  wrapper:{
    paddingHorizontal: 24,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    
  },
  wallet: {
    color: theme.colors.textSecondary,
  },
  amount: {
    color: theme.colors.secondary,
  },
});