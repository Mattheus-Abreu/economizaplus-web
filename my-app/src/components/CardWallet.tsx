import Dropdown from "@/components/dropdown";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, StyleSheet, Text, View } from "react-native";
import Wallet from "@/types/wallet";
import { useWallets } from "@/contexts/walletContext";

type Props = {
  item: Wallet;
};

function CardWallet({ item }: Props) {
  const router = useRouter();
  const { deleteWallet } = useWallets();

  function formatAmount(value: string): string {
    const num = parseFloat(value);
    if (isNaN(num)) return "–";
    return num.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function getWalletTypeLabel(type: string) {
    switch (type) {
      case "CHECKING_ACCOUNT":
        return "Corrente";
      case "SAVINGS_ACCOUNT":
        return "Poupança";
      case "CASH":
        return "Dinheiro";
      case "INVESTMENT":
        return "Investimento";
      default:
        return type;
    }
  }

  function handleEdit() {
    router.push({
      pathname: "/(protected)/wallet/createWallet",
      params: {
        id: item.id,
        name: item.name,
        type: item.type,
        balance: item.balance.toString(),
      },
    });
  }

  function handleDelete() {
    Alert.alert("Deletar carteira", "Tem certeza que deseja excluir essa carteira?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => deleteWallet(item.id),
      },
    ]);
  }

  return (
    <View style={styles.card}>
      
      <View style={styles.header}>
        <View style={styles.left}>
          <Ionicons name="wallet-outline" size={20} color="#fff" />

          <View>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.subtitle}>
              {getWalletTypeLabel(item.type)}
            </Text>
          </View>
        </View>

        <Dropdown>
          <Dropdown.Trigger style={styles.trigger}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
          </Dropdown.Trigger>

          <Dropdown.Content style={styles.menu}>
            <Dropdown.Item onPress={handleEdit}>
              <Text style={styles.itemText}>Editar</Text>
              <Ionicons name="pencil" size={16} color="#111" />
            </Dropdown.Item>

            <Dropdown.Item onPress={handleDelete}>
              <Text style={[styles.itemText, styles.destructive]}>
                Deletar
              </Text>
              <Ionicons name="trash-outline" size={16} color="#dc2626" />
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Saldo</Text>
        <Text style={styles.balanceValue}>
          R$ {formatAmount(item.balance.toString())}
        </Text>
      </View>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {getWalletTypeLabel(item.type)}
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: "#1A0F2E",
    gap: 16,

    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },

  subtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },

  balanceContainer: {
    marginTop: 10,
  },

  balanceLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },

  balanceValue: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginTop: 4,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

  trigger: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },

  menu: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 6,
  },

  itemText: {
    fontSize: 15,
    color: "#111",
  },

  destructive: {
    color: "#FF4D4D",
  },
});

export default CardWallet;