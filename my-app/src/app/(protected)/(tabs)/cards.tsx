import { api } from "@/api/api";
import Dropdown from "@/components/dropdown";
import AppModal, { MODAL_HIDDEN, ModalConfig } from "@/components/modal/modal";
import { PayInvoiceModal } from "@/components/modal/payInvoceModal";
import { BlurCarousel } from "@/components/molecules/blur-carousel";
import { Shimmer } from "@/components/shimmer/Shimmer";
import { useCard } from "@/contexts/cardContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import BancoIcon from "@/services/apiBanco";
import Card from "@/types/card";
import { BANK_COLORS, getBancoNomeSafe } from "@/utils/banco";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function cardPage() {
  const { cards, isLoading, loadCards, deleteCard } = useCard();
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [modal, setModal] = useState<ModalConfig>(MODAL_HIDDEN);
  const [payInvoiceVisible, setPayInvoiceVisible] = useState(false);
  const router = useRouter();
  const theme = useAppTheme();
  const styles = createStyles(theme);

  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [loadCards])
  );

  useEffect(() => {
    if (cards.length > 0) {
      const updated = currentCard
        ? cards.find((c) => c.id === currentCard.id) ?? cards[0]
        : cards[0];
      setCurrentCard(updated);
    }
  }, [cards]);

  

  const getBackgroundColor = (name: string) => {
    const key = name.toLowerCase().replace(/\s/g, "");
    return BANK_COLORS[key] ?? "#ec0192";
  };

  const formatCurrency = (value?: number | string | null) => {
    if (value === undefined || value === null || value === "") return "-";
    const numericValue =
      typeof value === "string"
        ? parseFloat(value.replace(/\s/g, "").replace(/,/g, ".").replace(/[^0-9.-]/g, ""))
        : Number(value);
    if (isNaN(numericValue)) return "-";
    return numericValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const formatDueDay = (day?: number | null) => {
    if (!day) return "-";
    return `Dia ${day}`;
  };

  const formatTransactionDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split("T")[0].split("-");
    return new Date(Number(year), Number(month) - 1, Number(day))
      .toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
  };

  const getComputedLimitRemaining = (card: Card) => {
    const total = Number(card.limitTotal ?? 0);
    if (!total) return Number(card.limitRemaining ?? 0);
  
    const spent = (card.transactions ?? []).reduce((acc, t) => {
      const amount = Math.abs(Number(t.amount ?? 0));
      return t.type === "EXPENSE" ? acc + amount : acc - amount;
    }, 0);
  
    return Math.max(0, total - spent);
  };

  // ── Limite usado em % ─────────────────────────────────────────────────────
  const getLimitUsedPercent = (card: Card) => {
    const total = Number(card.limitTotal ?? 0);
    const remaining = getComputedLimitRemaining(card);
    if (!total) return 0;
    return Math.min(100, Math.round(((total - remaining) / total) * 100));
  };

  // ── Ações ─────────────────────────────────────────────────────────────────
  function handleRegister() {
    if (!currentCard) return;
    router.push({
      pathname: "/transaction/createTransaction",
      params: {
        cardId: currentCard.id,
      },
    });
  }
  const getComputedLimitUsed = (card: Card) => {
    return (card.transactions ?? []).reduce((acc, t) => {
      const amount = Math.abs(Number(t.amount ?? 0));
      return t.type === "EXPENSE" ? acc + amount : acc - amount;
    }, 0);
  };
  function handlePayInvoice() {
    if (!currentCard) return;
    if (currentCard.type !== "CREDIT") {
      setModal({
        visible: true,
        variant: "warning",
        title: "Não disponível",
        description: "Pagamento de fatura está disponível apenas para cartões de crédito.",
      });
      return;
    }
    setPayInvoiceVisible(true);
  }

    async function handleConfirmPayment(amount: number) {
      setPayInvoiceVisible(false);
      try {
        await api.patch(`/api/cards/${currentCard!.id}/pay-invoice`, { amount });
        await loadCards();
        setTimeout(() => setModal({
          visible: true,
          variant: "success",
          title: "Fatura paga!",
          description: `Pagamento de ${formatCurrency(amount)} registrado.`,
        }), 300);
      } catch (error: any) {
        console.log("❌ Erro ao pagar fatura:", JSON.stringify(error?.response?.data ?? error?.message ?? error, null, 2));
        setTimeout(() => setModal({
          visible: true,
          variant: "error",
          title: "Erro",
          description: "Não foi possível registrar o pagamento.",
        }), 300);
      }
    }

  function handleEditCard() {
    if (!currentCard) return;
    router.push({
      pathname: "/addCard/newCard",
      params: {
        id: currentCard.id,
        nameBank: currentCard.name,
        brandBank: currentCard.brand,
        typeCard: currentCard.type,
        lastDigits: currentCard.last4Digits,
        limitTotal: String(currentCard.limitTotal),
        closingDay: String(currentCard.closingDay),
        dueDay: String(currentCard.dueDay),
      },
    });
  }

  function handleDeleteCard() {
    if (!currentCard) return;
    setModal({
      visible: true,
      variant: "confirm",
      title: "Excluir cartão",
      description: `Tem certeza que deseja excluir o cartão ${currentCard.name} **** ${currentCard.last4Digits}? Esta ação não pode ser desfeita.`,
      buttons: [
        { label: "Cancelar", variant: "secondary", onPress: () => setModal(MODAL_HIDDEN) },
        {
          label: "Excluir",
          variant: "danger",
          onPress: async () => {
            setModal(MODAL_HIDDEN);
            try {
              await deleteCard(currentCard.id);
              setCurrentCard(cards.find((c) => c.id !== currentCard.id) ?? null);
              setTimeout(() => setModal({
                visible: true,
                variant: "success",
                title: "Cartão excluído",
                description: "O cartão foi removido com sucesso.",
              }), 300);
            } catch {
              setTimeout(() => setModal({
                visible: true,
                variant: "error",
                title: "Erro",
                description: "Não foi possível excluir o cartão.",
              }), 300);
            }
          },
        },
      ],
    });
  }

  const handleSnapToItem = useCallback(
    (index: number) => {
      if (cards[index]) setCurrentCard(cards[index]);
    },
    [cards]
  );

  const renderTransactions = () => {
    const transactions = currentCard?.transactions;
    if (!transactions || transactions.length === 0) {
      return (
        <View style={styles.emptyTransactions}>
          <Ionicons name="receipt-outline" size={32} color={theme.colors.textSecondary} />
          <Text style={styles.emptyTransactionsText}>Nenhuma transação neste cartão</Text>
        </View>
      );
    }
    return transactions.map((transaction, index) => (
      <View key={transaction.id ?? index} style={styles.transactionRow}>
        <View style={[styles.transactionDot, {
            backgroundColor: transaction.type === "INCOME" ? "#4ade80" : "#ff6b6b"
          }]} />
        <View style={styles.transactionLeft}>
          <Text style={styles.transactionDescription}>{transaction.description}</Text>
          <Text style={styles.transactionDate}>
            {formatTransactionDate(transaction.transactionDate)}
          </Text>
        </View>
        <Text style={[styles.transactionAmount, {
          color: transaction.type === "INCOME" ? "#4ade80" : "#ff6b6b",
        }]}>
          {transaction.type === "INCOME" ? "+" : "−"} {formatCurrency(Math.abs(Number(transaction.amount)))}
        </Text>
      </View>
    ));
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Meus Cartões</Text>
          <Text style={styles.heroTitle}>Cartões</Text>
        </View>

        <Dropdown>
          <Dropdown.Trigger style={styles.addBtn}>
            <Ionicons name="add" size={20} color="#fff" />
          </Dropdown.Trigger>

          <Dropdown.Content style={styles.dropdownContent}>
            <Dropdown.Item onPress={() => router.push("/addCard/newCard")} style={styles.dropdownItem}>
              <Ionicons name="card-outline" size={16} color={theme.colors.text} />
              <Text style={styles.dropdownItemText}>Novo cartão</Text>
            </Dropdown.Item>

          

            <Dropdown.Item onPress={handleRegister} style={styles.dropdownItem}>
              <Ionicons name="add-circle-outline" size={16} color={theme.colors.text} />
              <Text style={styles.dropdownItemText}>Regis. transação</Text>
            </Dropdown.Item>

           
            {currentCard?.type === "CREDIT" && (
              <Dropdown.Item onPress={handlePayInvoice} style={styles.dropdownItem}>
                <Ionicons name="cash-outline" size={16} color={theme.colors.text} />
                <Text style={styles.dropdownItemText}>Pagar fatura</Text>
              </Dropdown.Item>
            )}

            <Dropdown.Item onPress={handleEditCard} style={styles.dropdownItem}>
              <Ionicons name="pencil-outline" size={16} color={theme.colors.text} />
              <Text style={styles.dropdownItemText}>Editar cartão</Text>
            </Dropdown.Item>

            

            <Dropdown.Item onPress={handleDeleteCard} style={styles.dropdownItem}>
              <Ionicons name="trash-outline" size={16} color={theme.colors.destructive} />
              <Text style={[styles.dropdownItemText, { color: theme.colors.destructive }]}>Excluir cartão</Text>
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>
      </View>

      {/* ── Carousel ───────────────────────────────────────────────────────── */}
      {isLoading ? (
        <View style={styles.carouselArea}>
          <Shimmer style={styles.cardSkeleton} />
        </View>
      ) : cards.length === 0 ? (
        <View style={styles.emptyCarousel}>
          <View style={styles.emptyCardPlaceholder}>
            <FontAwesome name="credit-card" size={40} color={theme.colors.textSecondary} />
            <Text style={styles.emptyCardText}>Nenhum cartão cadastrado</Text>
            <TouchableOpacity
              style={styles.emptyCardBtn}
              onPress={() => router.push("/addCard/newCard")}
            >
              <Ionicons name="add" size={14} color="#fff" />
              <Text style={styles.emptyCardBtnText}>Adicionar cartão</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.carouselArea}>
          <BlurCarousel
            data={cards}
            onSnapToItem={handleSnapToItem}
            renderItem={({ item }: { item: Card }) => {
              const usedPercent = getLimitUsedPercent(item);
              return (
                <View style={styles.card}>
                  <View style={[styles.cardBackground, { backgroundColor: getBackgroundColor(item.name) }]} />

                  {/* Overlay escuro sutil para legibilidade */}
                  <View style={styles.cardOverlay} />

                  {/* Top row */}
                  <View style={styles.cardTop}>
                    <View style={styles.cardIconWrap}>
                      <BancoIcon nome={getBancoNomeSafe(item.name) as any} tamanho={38} />
                    </View>
                    <View style={styles.cardChip}>
                      <Text style={styles.cardChipText}>
                        {item.type === "CREDIT" ? "Crédito" : "Débito"}
                      </Text>
                    </View>
                  </View>

                  {/* Dígitos */}
                  <Text style={styles.cardDigits}>•••• •••• •••• {item.last4Digits}</Text>

                  {/* Bottom row */}
                  <View style={styles.cardBottom}>
                    <View>
                      <Text style={styles.cardBottomLabel}>Titular</Text>
                      <Text style={styles.cardBottomValue}>{item.name}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.cardBottomLabel}>Vencimento</Text>
                      <Text style={styles.cardBottomValue}>{formatDueDay(item.dueDay)}</Text>
                    </View>
                  </View>

                  {/* Barra de limite */}
                  {item.type === "CREDIT" && (
                    <View style={styles.limitBar}>
                      <View style={[styles.limitBarFill, { width: `${usedPercent}%` as any }]} />
                    </View>
                  )}
                </View>
              );
            }}
          />
        </View>
      )}

      {/* ── Surface ────────────────────────────────────────────────────────── */}
      <View style={styles.surface}>

        {/* Resumo do cartão atual */}
        {currentCard && (
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Limite total</Text>
              <Text style={styles.summaryValue}>{formatCurrency(currentCard.limitTotal)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Disponível</Text>
              <Text style={[styles.summaryValue, { color: "#4ade80" }]}>
                {formatCurrency(getComputedLimitRemaining(currentCard))}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Fechamento</Text>
              <Text style={styles.summaryValue}>{formatDueDay(currentCard.closingDay)}</Text>
            </View>
          </View>
        )}

        {/* ── Transações ─────────────────────────────────────────────────── */}
        <View style={styles.transactionsSection}>
          <View style={styles.transactionsSectionHeader}>
            <Text style={styles.transactionsSectionTitle}>Últimas transações</Text>
            {currentCard && (
              <Text style={styles.transactionsSectionSub}>
                {currentCard.name} •••• {currentCard.last4Digits}
              </Text>
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Shimmer key={i} style={styles.transactionSkeleton} />
                ))
              : renderTransactions()}
          </ScrollView>
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
      <PayInvoiceModal
        visible={payInvoiceVisible}
        totalDue={getComputedLimitUsed(currentCard ?? { transactions: [] } as any)}
        onClose={() => setPayInvoiceVisible(false)}
        onConfirm={handleConfirmPayment}
      />
    </GestureHandlerRootView>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    // ── Header ──────────────────────────────────────────────────────────────
    header: {
      paddingHorizontal: 20,
      paddingTop: 64,
      paddingBottom: 12,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 16,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.colors.glass + "10",
      borderWidth: 0.5,
      borderColor: theme.colors.glass,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 4,
    },
    hero: {
      flex: 1,
      gap: 2,
    },
    heroLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: theme.colors.primary,
      letterSpacing: 1.4,
      textTransform: "uppercase",
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.colors.text,
    },
    addBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 4,
    },

    // ── Carousel ────────────────────────────────────────────────────────────
    carouselArea: {
      paddingVertical: 12,
    },
    cardSkeleton: {
      marginHorizontal: 20,
      height: 190,
      borderRadius: 20,
    },
    emptyCarousel: {
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    emptyCardPlaceholder: {
      height: 190,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      borderStyle: "dashed",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    emptyCardText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
    },
    emptyCardBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
    },
    emptyCardBtnText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: "600",
    },

    // ── Card visual ──────────────────────────────────────────────────────────
    card: {
      width: "100%",
      height: 190,
      borderRadius: 20,
      overflow: "hidden",
      padding: 20,
      justifyContent: "space-between",
    },
    cardBackground: {
      ...StyleSheet.absoluteFillObject,
    },
    cardOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.18)",
    },
    cardTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    cardIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: "rgba(255,255,255,0.15)",
      justifyContent: "center",
      alignItems: "center",
    },
    cardChip: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 20,
      borderWidth: 0.5,
      borderColor: "rgba(255,255,255,0.3)",
    },
    cardChipText: {
      fontSize: 11,
      fontWeight: "600",
      color: "#fff",
      letterSpacing: 0.5,
    },
    cardDigits: {
      fontSize: 15,
      fontWeight: "500",
      color: "rgba(255,255,255,0.9)",
      letterSpacing: 2,
    },
    cardBottom: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },
    cardBottomLabel: {
      fontSize: 9,
      color: "rgba(255,255,255,0.6)",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 2,
    },
    cardBottomValue: {
      fontSize: 14,
      fontWeight: "600",
      color: "#fff",
    },
    limitBar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 3,
      backgroundColor: "rgba(255,255,255,0.2)",
    },
    limitBarFill: {
      height: 3,
      backgroundColor: "rgba(255,255,255,0.7)",
    },

    // ── Surface ──────────────────────────────────────────────────────────────
    surface: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingTop: 24,
      paddingHorizontal: 20,
      gap: 20,
    },

    // ── Summary ──────────────────────────────────────────────────────────────
    summaryRow: {
      flexDirection: "row",
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: theme.colors.glass,
      marginTop: -10,
      overflow: "hidden",
    },
    summaryItem: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 14,
      gap: 4,
    },
    summaryDivider: {
      width: 0.5,
      backgroundColor: theme.colors.border,
      alignSelf: "stretch",
      marginVertical: 10,
    },
    summaryLabel: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    summaryValue: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.colors.text,
    },

    // ── Dropdown ─────────────────────────────────────────────────────────────
    dropdownContent: {
      backgroundColor: theme.colors.surface,
      borderWidth: 0.5,
      borderColor: theme.colors.glass,
      minWidth: 220,
    },
    dropdownItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderBottomWidth: 0.5,                     
      borderBottomColor: theme.colors.border,
    },
    dropdownItemText: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: "500",
    },
    dropdownDivider: {
      height: 0.5,
      backgroundColor: "rgba(255,255,255,0.08)",
      marginHorizontal: 8,
    },

    // ── Transações ───────────────────────────────────────────────────────────
    transactionsSection: {
      flex: 1,
      gap: 12,
    },
    transactionsSectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
    },
    transactionsSectionTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: theme.colors.text,
    },
    transactionsSectionSub: {
      fontSize: 11,
      color: theme.colors.textSecondary,
    },
    transactionSkeleton: {
      height: 56,
      borderRadius: 14,
      marginBottom: 8,
    },
    emptyTransactions: {
      paddingVertical: 40,
      alignItems: "center",
      gap: 10,
    },
    emptyTransactionsText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    transactionRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 14,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.colors.glass,
    },
    transactionDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      flexShrink: 0,
    },
    transactionLeft: {
      flex: 1,
      gap: 2,
    },
    transactionDescription: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
    },
    transactionDate: {
      fontSize: 11,
      color: theme.colors.textSecondary,
    },
    transactionAmount: {
      fontSize: 14,
      fontWeight: "700",
    },
  });