import { useTransactions } from "@/contexts/transactionContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Dropdown from "./dropdown";
import AppModal, { MODAL_HIDDEN, ModalConfig } from "./modal/modal";

type Transaction = {
  id: string;
  description?: string | null;
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  transactionDate: string;
  paymentMethod?: string;
  walletId?: string;
  goalId?: string;
  categoryId?: string;
  isInstallment?: boolean;
};

type Props = {
  item: Transaction;
};

export default function TransactionItem({ item }: Props) {
  const { deleteTransaction } = useTransactions();
  const router = useRouter();
  const [modal, setModal] = useState<ModalConfig>(MODAL_HIDDEN);
  const theme = useAppTheme();
  const styles = createStyles(theme);

  function getColor(type: string) {
    if (type === "INCOME") return "#22C55E";
    if (type === "EXPENSE") return "#EF4444";
    return "#7C3AED";
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const today = new Date();

    const normalize = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const diff =
      (normalize(today).getTime() - normalize(date).getTime()) /
      (1000 * 60 * 60 * 24);

    if (diff === 0) return "Hoje";
    if (diff === 1) return "Ontem";

    return date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
    });
  }

  function handleEdit() {
    router.push({
      pathname: "/(protected)/transaction/createTransaction",
      params: {
        id: item.id,
        type: item.type,
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
  setModal({
    visible: true,
    variant: "warning",
    title: "Excluir transação",
    description: "Tem certeza que deseja excluir?",
    buttons: [
      {
        label: "Cancelar",
        onPress: () => setModal(MODAL_HIDDEN),
        variant: "secondary",
      },
      {
        label: "Excluir",
        onPress: async () => {
          await deleteTransaction(item.id);
          setModal(MODAL_HIDDEN);
        },
        variant: "danger",
      },
    ],
  });
}

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.description}>
          {item.description || "Sem descrição"}
        </Text>

        <Text style={styles.date}>
          {formatDate(item.transactionDate)},{" "}
          {new Date(item.transactionDate).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>

      <View style={styles.right}>
        <Dropdown>
            <Dropdown.Trigger style={styles.trigger}>
            <Ionicons name="ellipsis-horizontal" size={18} color="#fff" />
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
                <Ionicons name="trash" size={16} color="#EF4444" />
            </Dropdown.Item>
            </Dropdown.Content>
        </Dropdown>

        <Text style={[styles.amount, { color: getColor(item.type) }]}>
            {item.type === "INCOME" ? "+ " : "- "}
            {item.amount.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            })}
        </Text>
    </View>

      <AppModal
        visible={modal.visible}
        onClose={() => setModal(MODAL_HIDDEN)}
        variant={modal.variant}
        title={modal.title}
        description={modal.description}
        buttons={modal.buttons}
      />
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => 
StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  left: { flex: 1 },

  description: {
    fontSize: 15,
    color: theme.colors.text,
  },

  date: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },

  amount: {
    fontSize: 15,
    fontWeight: "600",
  },

  right: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 6,
  },

  trigger: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },

  menu: {
    backgroundColor: "#FFF",
    borderRadius: 12,
  },

  itemText: {
    fontSize: 14,
    color: "#111",
  },

  destructive: {
    color: "#EF4444",
  },
});
