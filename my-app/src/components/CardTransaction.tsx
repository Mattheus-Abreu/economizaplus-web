import Dropdown from "@/components/dropdown";
import { useGoals } from "@/contexts/goalContext";
import Transaction from "@/types/transaction";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, StyleSheet, Text, View } from "react-native";
import { AnimatedProgressBar } from "./progressBar";

type Props = {
  item: Transaction;
  gradient?: [string, string];
};

function CardTransaction({ item, gradient }: Props) {
  const router = useRouter();
  const { deleteGoal } = useGoals();

  function formatAmount(value: string): string {
    const num = parseFloat(value);
    if (isNaN(num)) return "–";
    return num.toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
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
        goalId: item.goalId,
        categoryId: item.categoryId,
        isInstallment: String(item.isInstallment),
        installmentNumber: String(item.installmentNumber),
        installmentTotal: String(item.installmentTotal),
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
          onPress: () => deleteGoal(item.id),
        },
      ],
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{item.type}</Text>
          <Text style={styles.subtitle}>
            transação de R$ {formatAmount(item.amount.toString()) || "–"}
          </Text>
          <Text style={styles.subtitle}>{item.description}</Text>
          <Text style={{ ...styles.subtitle, fontSize: 12 }}>
            Prazo: {new Date(item.transactionDate).toLocaleDateString("pt-BR")}
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
              <Text style={[styles.itemText, styles.destructive]}>Deletar</Text>
              <Ionicons name="trash-outline" size={16} color="#dc2626" />
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>
      </View>
      <AnimatedProgressBar
        progress={0.5}
        useGradient
        gradientColors={gradient ?? ["#4dabf7", "#3b5bdb"]}
        trackColor="rgba(255,255,255,0.08)"
        showPercentage
        width={"85%"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 24,
    padding: 20,
    backgroundColor: "#1A0F2E",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
    gap: 12,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
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
    paddingHorizontal: 4,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
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
