import Dropdown from "@/components/dropdown";
import { useCategory } from "@/contexts/categoryContext";
import { useGoals } from "@/contexts/goalContext";
import { useTransactions } from "@/contexts/transactionContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import Transaction from "@/types/transaction";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AppModal, { MODAL_HIDDEN, ModalConfig } from "./modal/modal";

type Props = {
  item: Transaction;
};

function CardTransaction({ item }: Props) {
  const router = useRouter();
  const { deleteTransaction } = useTransactions();
  const { categories } = useCategory();
  const { goals } = useGoals();
  const [modal, setModal] = useState<ModalConfig>(MODAL_HIDDEN);
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const category = useMemo(() => {
    return (categories ?? []).find((c) => c.id === item.categoryId);
  }, [categories, item.categoryId]);

  const goal = useMemo(() => {
    return goals?.find(g => g.id === item.goalId);
  }, [goals, item.goalId]);

  function formatAmount(value: number): string {
    if (!value) return "–";
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function getTypeColor(type: string) {
    switch (type) {
      case "INCOME":
        return "#22C55E";
      case "EXPENSE":
        return "#F43F5E";
      case "TRANSFER":
        return "#FF9800";
      default:
        return "#fff";
    }
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
    <Pressable
      onPress={() => {}}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View
        style={[
          styles.typeIndicator,
          { backgroundColor: getTypeColor(item.type) },
        ]}
      />

      <View style={styles.container}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: (category?.color ?? "#7C3AED") + "20",
            },
          ]}
        >
          <FontAwesome
            name={category?.icon ?? "question"}
            size={20}
            color={category?.color ?? "#7C3AED"}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>
            {category?.name ?? goal?.name ?? item.description}
          </Text>

          {(goal?.description || item.description) && (
            <Text style={styles.subtitle}>
              {goal?.description || item.description}
            </Text>
          )}

          <View style={styles.metaRow}>
            <Text style={styles.date}>
              {formatDate(item.transactionDate)}
            </Text>
          </View>
        </View>

        <View style={styles.right}>
          <Dropdown>
            <Dropdown.Trigger style={styles.trigger}>
              <Ionicons name="ellipsis-horizontal" size={18} color={theme.colors.text} />
            </Dropdown.Trigger>

            <Dropdown.Content style={styles.menu}>
              <Dropdown.Item onPress={handleEdit}>
                <Text style={styles.itemText}>Editar</Text>
                <Ionicons name="pencil" size={16} color={theme.colors.foreground}/>
              </Dropdown.Item>

              <Dropdown.Item onPress={handleDelete}>
                <Text style={[styles.itemText, styles.destructive]}>
                  Deletar
                </Text>
                <Ionicons name="trash" size={16} color={theme.colors.destructive} />
              </Dropdown.Item>
            </Dropdown.Content>
          </Dropdown>

          <Text
            style={[
              styles.amount,
              { color: getTypeColor(item.type) },
            ]}
          >
            {item.type === "INCOME" ? "+" : "−"} {formatAmount(item.amount)}
          </Text>
        </View>
      </View>

      <AppModal
        visible={modal.visible}
        onClose={() => setModal(MODAL_HIDDEN)}
        variant={modal.variant}
        title={modal.title}
        description={modal.description}
        buttons={modal.buttons}
      />
    </Pressable>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => 
StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.glass,
    overflow: "hidden",
  },

  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },

  typeIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },

  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    flex: 1,
    gap: 2,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },

  subtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },

  date: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },

  right: {
    alignItems: "flex-end",
    gap: 6,
  },

  amount: {
    fontSize: 18,
    fontWeight: "800",
  },

  trigger: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: theme.colors.glass,
    justifyContent: "center",
    alignItems: "center",
  },

  menu: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    paddingVertical: 6,
  },

  itemText: {
    fontSize: 15,
    color: theme.colors.foreground,
    fontWeight: "500",
  },

  destructive: {
    color: theme.colors.destructive,
  },
});

export default CardTransaction;