import Dropdown from "@/components/dropdown";
import { useTransactions } from "@/contexts/transactionContext";
import Transaction from "@/types/transaction";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, StyleSheet, Text, View } from "react-native";

type Props = {
  item: Transaction;
};

function CardTransaction({ item }: Props) {
  const router = useRouter();
  const { deleteTransaction } = useTransactions();

  function formatAmount(value: number): string {
    if (!value) return "–";
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function getTypeName(type: string) {
    switch (type) {
      case "INCOME":
        return "Entrada";
      case "EXPENSE":
        return "Saída";
      case "TRANSFER":
        return "Transferência";
      default:
        return type;
    }
  }

  function getTypeColor(type: string) {
    switch (type) {
      case "INCOME":
        return "#22C55E"; 
      case "EXPENSE":
        return "#F43F5E"; 
      case "TRANSFER":
        return "#7C3AED"; 
      default:
        return "#fff";
    }
  }

  function handleEdit() {
    router.push({
      pathname: "/(protected)/transaction/createTransaction",
      params: {
        id: item.id,
        type: item.type,
        paymentMethod: item.paymentMethod,
        amount: item.amount.toString(),
        description: item.description,
        transactionDate: item.transactionDate,
        walletId: item.walletId,
        goal_id: item.goalId,
        categoryId: item.categoryId,
        isInstallment: String(item.isInstallment),

      },
    });
  }

  function handleDelete() {
    Alert.alert(
      "Deletar transação",
      "Tem certeza que deseja excluir essa transação?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => deleteTransaction(item.id),
        },
      ]
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.title,
              { color: getTypeColor(item.type) },
            ]}
          >
            {getTypeName(item.type)}
          </Text>

          <Text style={styles.amount}>
            R$ {formatAmount(item.amount)}
          </Text>

          {item.description && (
            <Text style={styles.subtitle}>
              {item.description}
            </Text>
          )}

          <Text style={styles.date}>
            {new Date(item.transactionDate).toLocaleDateString("pt-BR")}
          </Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 20,
    padding: 16,
    backgroundColor: "#1A0F2E",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
  },

  amount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginTop: 4,
  },

  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },

  date: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    marginTop: 4,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 6,
  },

  itemText: {
    fontSize: 15,
    color: "#111",
    fontWeight: "500",
  },

  destructive: {
    color: "#FF4D4D",
  },
});

export default CardTransaction;