import CardInsights from "@/components/CardInsights";
import Dropdown from "@/components/dropdown";
import FloatingButton from "@/components/FloatingButton";
import AppModal, { MODAL_HIDDEN, ModalConfig } from "@/components/modal/modal";
import Screen from "@/components/Screen";
import TransactionList from "@/components/TransactionList";
import { useCategory } from "@/contexts/categoryContext";
import { useTransactions } from "@/contexts/transactionContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
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
  const { deleteCategory } = useCategory();
  const { transactions } = useTransactions();
  const [modal, setModal] = useState<ModalConfig>(MODAL_HIDDEN);
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const category = (categories ?? []).find((c) => c.id === params.id);

  const categoryTransactions = useMemo(() => {
    return (transactions ?? [])
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

  function handleEdit() {
    if (category?.type === "default"){
      return setModal({
        visible: true,
        variant: "error",
        title: "Erro",
        description: "Essa categoria não pode ser editada.",
        buttons: [
          {
            label: "Fechar",
            onPress: () => setModal(MODAL_HIDDEN),
            variant: "secondary",
          },
        ],
      })
    }
    router.push({
      pathname: "/(protected)/category/createCategory",
      params: {
        id: category?.id,
        name: category?.name,
        color: category?.color,
      },
    });
  }

  function handleDelete() {
    if (category?.type === "default"){
      return setModal({
        visible: true,
        variant: "error",
        title: "Erro",
        description: "Essa categoria não pode ser excluida.",
        buttons: [
          {
            label: "Fechar",
            onPress: () => setModal(MODAL_HIDDEN),
            variant: "secondary",
          },
        ],
      })
    }
    setModal({
      visible: true,
      variant: "warning",
      title: "Excluir categoria",
      description: "Tem certeza que deseja excluir essa categoria? Essa ação nao pode ser desfeita.",
      buttons: [
        {
          label: "Cancelar",
          onPress: () => setModal(MODAL_HIDDEN),
          variant: "secondary",
        },
        {
          label: "Excluir",
          onPress: async () => {
            await deleteCategory(category?.id!);
            setModal(MODAL_HIDDEN);
          },
          variant: "danger",
        },
      ],
  });
}

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

        <Dropdown>
          <Dropdown.Trigger style={styles.trigger}>
            <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.text} />
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
        <CardInsights
          title="Total gasto"
          subtitle={totalExpense.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        />
        <CardInsights
          title="Transações"
          subtitle={totalTransactions.toString()}
        />
        <CardInsights
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
      <AppModal
        visible={modal.visible}
        onClose={() => setModal(MODAL_HIDDEN)}
        variant={modal.variant}
        title={modal.title}
        description={modal.description}
        buttons={modal.buttons}
      />
    </Screen>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => 
StyleSheet.create({
  header: {
    paddingTop: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.glass + "5",
    borderWidth: 0.5,
    borderColor: theme.colors.glass,
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

export default categoryDetail;
