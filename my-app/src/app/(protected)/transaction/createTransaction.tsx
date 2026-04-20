import theme from "@/app/themes/theme";
import Button from "@/components/Button";
import Screen from "@/components/Screen";
import Input from "@/components/inputs/Input";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { BaseButton } from "react-native-gesture-handler";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTransactions } from "@/contexts/transactionContext";
import { useGoals } from "@/contexts/goalContext";
import { useCategory } from "@/contexts/categoryContext";
import { useWallets } from "@/contexts/walletContext";
import { useCard } from "@/contexts/cardContext";
import { MODAL_HIDDEN, ModalConfig } from "@/components/modal/modal";
import AppModal from "@/components/modal/modal";

type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";
type PaymentMethod = "CASH" | "CREDIT_CARD" | "DEBIT_CARD" | "PIX" | "BANK_TRANSFER";
type InstallmentType = "SIM" | "NAO";

function CreateTransaction() {
  const router = useRouter();
  const { addTransaction, updateTransaction } = useTransactions();
  const { goals } = useGoals();
  const { categories } = useCategory();
  const { wallets } = useWallets();
  const { cards } = useCard();
  const [modal, setModal] = useState<ModalConfig>(MODAL_HIDDEN);

  const params = useLocalSearchParams<{
    id?: string;
    type?: string;
    paymentMethod?: string;
    walletId?: string;
    cardId?: string;
    destinationWalletId?: string;
    amount?: string;
    description?: string;
    transactionDate?: string;
    goal_id?: string;
    categoryId?: string;
    isInstallment?: string;
    totalInstallments?: string;
  }>();

  const isEditing = !!params.id;

  const [type, setType] = useState<TransactionType | "">(
    (params.type as TransactionType) ?? ""
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">(
    (params.paymentMethod as PaymentMethod) ?? ""
  );
  const [walletId, setWalletId] = useState(params.walletId ?? "");
  const [cardId, setCardId] = useState(params.cardId ?? "");
  const [destinationWalletId, setDestinationWalletId] = useState(
    params.destinationWalletId ?? ""
  );
  const [amount, setAmount] = useState(params.amount ?? "");
  const [description, setDescription] = useState(params.description ?? "");
  const [transactionDate, setTransactionDate] = useState(
    params.transactionDate ?? ""
  );
  const [goal_id, setGoal_id] = useState(params.goal_id ?? "");
  const [categoryId, setCategoryId] = useState(params.categoryId ?? "");
  const [isInstallment, setIsInstallment] = useState<InstallmentType | "">(
    (params.isInstallment as InstallmentType) ?? ""
  );
  const [totalInstallments, setTotalInstallments] = useState(
    params.totalInstallments ?? ""
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const transactionsTypes: { id: TransactionType; name: string }[] = [
    { id: "INCOME", name: "Entrada" },
    { id: "EXPENSE", name: "Saída" },
    { id: "TRANSFER", name: "Transferência" },
  ];

  const paymentMethods: { id: PaymentMethod; name: string }[] = [
    { id: "CASH", name: "Dinheiro" },
    { id: "CREDIT_CARD", name: "Cartão de Crédito" },
    { id: "DEBIT_CARD", name: "Cartão de Débito" },
    { id: "PIX", name: "Pix" },
    { id: "BANK_TRANSFER", name: "Transferência Bancária" },
  ];

  const installmentOptions: { id: InstallmentType; name: string }[] = [
    { id: "SIM", name: "Sim" },
    { id: "NAO", name: "Não" },
  ];

  const isCard = paymentMethod === "CREDIT_CARD" || paymentMethod === "DEBIT_CARD";
  const isCreditCard = paymentMethod === "CREDIT_CARD";
  const isTransfer = type === "TRANSFER";
  const isParcelado = isInstallment === "SIM";

  function formatAmount(value: string): string {
    const num = parseFloat(value);
    if (isNaN(num)) return "–";
    return num.toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  function formatDisplayDate(iso: string): string {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return "Selecione uma data";
    return date.toLocaleDateString("pt-BR");
  }

  function calculateInstallmentValue() {
    const principal = Number(amount);
    const num = Number(totalInstallments);
    if (!principal || !num || num <= 0) return 0;
    return principal / num;
  }

  function getTransactionTypeName(t: TransactionType | "") {
    return transactionsTypes.find((x) => x.id === t)?.name ?? "Tipo da transação";
  }

  function handleChangeType(t: TransactionType) {
    setType(t);
    setDestinationWalletId("");
    setPaymentMethod("");
    setIsInstallment("");
    setTotalInstallments("");
    setCardId("");
  }

  function handleChangePaymentMethod(p: PaymentMethod) {
    setPaymentMethod(p);
    setIsInstallment("");
    setTotalInstallments("");
    setCardId("");
  }

  async function handleSubmit() {
    if (!type || !amount || !transactionDate || !walletId) {
      return setModal({
        visible: true,
        variant: "error",
        title: "Dados incompletos",
        description: "Preencha tipo, valor, data e carteira!"
      })
    }

    if (isTransfer && !destinationWalletId) {
      return setModal({
        visible: true,
        variant: "error",
        title: "Dados incompletos",
        description: "Selecione a carteira de destino!"
      });
    }

    if (isCreditCard && !cardId) {
      return setModal({
        visible: true,
        variant: "error",
        title: "Dados incompletos",
        description: "Selecione o cartão de crédito!"
      });
    }

    try {
      if (isEditing) {
        await updateTransaction(params.id!, {
          type,
          amount: Number(amount),
          transactionDate,
        });
        setModal({
          visible: true,
          variant: "success",
          title: "Transação atualizada",
          description: "As informações da transação foram atualizadas com sucesso."
        })
      } else {
        await addTransaction({
          type,
          paymentMethod: paymentMethod || undefined,
          walletId,
          cardId: cardId || undefined,
          destinationWalletId: destinationWalletId || undefined,
          amount: Number(amount),
          description: description || undefined,
          transactionDate,
          goal_id: goal_id || undefined,
          categoryId: categoryId || undefined,
          isInstallment: isParcelado,
          totalInstallments: isParcelado ? Number(totalInstallments) : undefined,
        });
        setModal({
          visible: true,
          variant: "success",
          title: "Transação criada",
          description: "Sua nova transação foi criada com sucesso."
        })
      }
      router.back();
    } catch (error: any) {
      console.log(error);
      setModal({
        visible: true,
        variant: "error",
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar a transação."
      })
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: "padding" })}
    >
      <Screen style={{ padding: 0 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <FontAwesome
                name="arrow-left"
                size={16}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.hero}>
            <Text style={styles.heroLabel}>
              {isEditing ? "Editar transação" : "Nova transação"}
            </Text>
            <Text style={styles.heroTitle}>
              {isEditing
                ? "Redefina sua\ntransação"
                : "O que você\nquer registrar?"}
            </Text>
            <Text style={styles.heroSub}>
              {isEditing
                ? "Atualize os dados da sua transação"
                : "Registre uma entrada, saída ou transferência"}
            </Text>
          </View>

          <View style={styles.form}>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Tipo de transação</Text>
              <View style={styles.typeContainer}>
                {transactionsTypes.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => handleChangeType(t.id)}
                    style={[
                      styles.typeButton,
                      type === t.id && styles.typeButtonActive,
                    ]}
                  >
                    <Text style={{ color: type === t.id ? "#fff" : theme.colors.text }}>
                      {t.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Valor</Text>
              <View style={[styles.fieldInput, amount.length > 0 && styles.fieldInputActive]}>
                <Ionicons
                  name="cash-outline"
                  size={18}
                  color={amount.length > 0 ? theme.colors.primary : "#94A3B8"}
                />
                <Text style={styles.currencyPrefix}>R$</Text>
                <Input
                  style={[styles.inlineInput, styles.amountInput]}
                  placeholder="0"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>
                {isTransfer ? "Carteira de origem" : "Carteira"}
              </Text>
              <View style={styles.typeContainer}>
                {wallets.length === 0 ? (
                  <Text style={styles.emptyField}>Nenhuma carteira cadastrada</Text>
                ) : (
                  wallets.map((w) => (
                    <TouchableOpacity
                      key={w.id}
                      onPress={() => setWalletId(w.id)}
                      style={[
                        styles.typeButton,
                        walletId === w.id && styles.typeButtonActive,
                      ]}
                    >
                      <Text style={{ color: walletId === w.id ? "#fff" : theme.colors.text }}>
                        {w.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>

            {isTransfer && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Carteira de destino</Text>
                <View style={styles.typeContainer}>
                  {wallets.filter((w) => w.id !== walletId).length === 0 ? (
                    <Text style={styles.emptyField}>Nenhuma outra carteira disponível</Text>
                  ) : (
                    wallets
                      .filter((w) => w.id !== walletId)
                      .map((w) => (
                        <TouchableOpacity
                          key={w.id}
                          onPress={() =>
                            setDestinationWalletId(
                              destinationWalletId === w.id ? "" : w.id
                            )
                          }
                          style={[
                            styles.typeButton,
                            destinationWalletId === w.id && styles.typeButtonActive,
                          ]}
                        >
                          <Text style={{ color: destinationWalletId === w.id ? "#fff" : theme.colors.text }}>
                            {w.name}
                          </Text>
                        </TouchableOpacity>
                      ))
                  )}
                </View>
              </View>
            )}

            {!isTransfer && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Método de pagamento</Text>
                <View style={styles.typeContainer}>
                  {paymentMethods.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => handleChangePaymentMethod(p.id)}
                      style={[
                        styles.typeButton,
                        paymentMethod === p.id && styles.typeButtonActive,
                      ]}
                    >
                      <Text style={{ color: paymentMethod === p.id ? "#fff" : theme.colors.text }}>
                        {p.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {isCard && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>
                  {isCreditCard ? "Cartão de crédito" : "Cartão de débito"}
                </Text>
                <View style={styles.typeContainer}>
                  {cards.filter((c) =>
                    isCreditCard ? c.type === "CREDIT" : c.type === "DEBIT"
                  ).length === 0 ? (
                    <Text style={styles.emptyField}>
                      Nenhum cartão {isCreditCard ? "de crédito" : "de débito"} cadastrado
                    </Text>
                  ) : (
                    cards
                      .filter((c) =>
                        isCreditCard ? c.type === "CREDIT" : c.type === "DEBIT"
                      )
                      .map((c) => (
                        <TouchableOpacity
                          key={c.id}
                          onPress={() => setCardId(cardId === c.id ? "" : c.id)}
                          style={[
                            styles.typeButton,
                            cardId === c.id && styles.typeButtonActive,
                          ]}
                        >
                          <Text style={{ color: cardId === c.id ? "#fff" : theme.colors.text }}>
                            {c.name} •••• {c.last4Digits}
                          </Text>
                        </TouchableOpacity>
                      ))
                  )}
                </View>
              </View>
            )}

            {isCard && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Pagou parcelado?</Text>
                <View style={styles.typeContainer}>
                  {installmentOptions.map((i) => (
                    <TouchableOpacity
                      key={i.id}
                      onPress={() => setIsInstallment(i.id)}
                      style={[
                        styles.typeButton,
                        isInstallment === i.id && styles.typeButtonActive,
                      ]}
                    >
                      <Text style={{ color: isInstallment === i.id ? "#fff" : theme.colors.text }}>
                        {i.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {isParcelado && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Número de parcelas</Text>
                <View style={[styles.fieldInput, totalInstallments.length > 0 && styles.fieldInputActive]}>
                  <Ionicons
                    name="card-sharp"
                    size={18}
                    color={totalInstallments.length > 0 ? theme.colors.primary : "#94A3B8"}
                  />
                  <Input
                    style={styles.inlineInput}
                    placeholder="Ex.: 12"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="numeric"
                    value={totalInstallments}
                    onChangeText={setTotalInstallments}
                  />
                </View>
              </View>
            )}

            {isParcelado && totalInstallments.length > 0 && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Valor das parcelas</Text>
                <View style={[styles.fieldInput, styles.fieldInputActive]}>
                  <Ionicons name="cash-outline" size={18} color={theme.colors.primary} />
                  <Text style={{ color: theme.colors.text, fontSize: 15, flex: 1 }}>
                    {`${totalInstallments}x de R$ ${formatAmount(
                      String(calculateInstallmentValue())
                    )}`}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Quando foi feita?</Text>
              <BaseButton onPress={() => setShowDatePicker(true)}>
                <View
                  style={[
                    styles.fieldInput,
                    transactionDate ? styles.fieldInputActive : null,
                  ]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={transactionDate ? theme.colors.primary : "#94A3B8"}
                  />
                  <Text style={styles.dateText}>
                    {formatDisplayDate(transactionDate)}
                  </Text>
                </View>
              </BaseButton>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Meta (opcional)</Text>
              <View style={styles.typeContainer}>
                {goals.length === 0 ? (
                  <Text style={styles.emptyField}>Nenhuma meta cadastrada</Text>
                ) : (
                  goals.map((g) => (
                    <TouchableOpacity
                      key={g.id}
                      onPress={() => setGoal_id(goal_id === g.id ? "" : g.id)}
                      style={[
                        styles.typeButton,
                        goal_id === g.id && styles.typeButtonActive,
                      ]}
                    >
                      <Text style={{ color: goal_id === g.id ? "#fff" : theme.colors.text }}>
                        {g.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Categoria (opcional)</Text>
              <View style={styles.typeContainer}>
                {categories.length === 0 ? (
                  <Text style={styles.emptyField}>Nenhuma categoria cadastrada</Text>
                ) : (
                  categories.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() =>
                        setCategoryId(categoryId === c.id ? "" : c.id)
                      }
                      style={[
                        styles.typeButton,
                        categoryId === c.id && styles.typeButtonActive,
                      ]}
                    >
                      <Text style={{ color: categoryId === c.id ? "#fff" : theme.colors.text }}>
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Descrição (opcional)</Text>
              <View style={[styles.fieldInput, description.length > 0 && styles.fieldInputActive]}>
                <Ionicons
                  name="pencil"
                  size={18}
                  color={description.length > 0 ? theme.colors.primary : "#94A3B8"}
                />
                <Input
                  style={styles.inlineInput}
                  placeholder="Ex.: Compra de roupas"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            </View>

          </View>

          <DateTimePickerModal
            date={transactionDate ? new Date(transactionDate) : new Date()}
            isVisible={showDatePicker}
            locale="pt-BR"
            mode="date"
            onConfirm={(date) => {
              setTransactionDate(date.toISOString());
              setShowDatePicker(false);
            }}
            onCancel={() => setShowDatePicker(false)}
          />

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerLabel}>Prévia</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.previewWrapper}>
            <LinearGradient
              colors={
                type === "INCOME"
                  ? ["#22C55E", "#4ADE80"]
                  : type === "EXPENSE"
                  ? ["#F43F5E", "#FB7185"]
                  : ["#7C3AED", "#A78BFA"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.previewCard}
            >
              <View style={styles.previewLeft}>
                <Text style={styles.previewName} numberOfLines={1}>
                  {getTransactionTypeName(type)}
                </Text>
                <Text style={styles.previewAmount}>
                  R$ {formatAmount(amount) || "–"} ·{" "}
                  {transactionDate
                    ? new Date(transactionDate).toLocaleDateString("pt-BR", {
                        month: "short",
                        year: "numeric",
                      })
                    : "sem data"}
                </Text>
                {isParcelado && totalInstallments && (
                  <Text style={styles.previewAmount}>
                    {totalInstallments}x de R${" "}
                    {formatAmount(String(calculateInstallmentValue()))}
                  </Text>
                )}
                {isTransfer && destinationWalletId && (
                  <Text style={styles.previewAmount}>
                    → {wallets.find((w) => w.id === destinationWalletId)?.name}
                  </Text>
                )}
              </View>
            </LinearGradient>
          </View>

          <View style={styles.cta}>
            <Button
              label={isEditing ? "Salvar alterações" : "Criar transação"}
              onPress={handleSubmit}
            />
          </View>
        </ScrollView>
        <AppModal
          visible={modal.visible}
          onClose={() => setModal(MODAL_HIDDEN)}
          variant={modal.variant}
          title={modal.title}
          description={modal.description}
          buttons={modal.buttons}
        />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.primary,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text,
    lineHeight: 34,
  },
  heroSub: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 8,
    lineHeight: 18,
  },
  form: {
    paddingHorizontal: 24,
    gap: 16,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: theme.colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingLeft: 2,
  },
  fieldInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    height: 54,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
  },
  fieldInputActive: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(124,58,237,0.06)",
  },
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  typeButton: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.glass,
    backgroundColor: theme.colors.surface,
  },
  typeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  emptyField: {
    color: theme.colors.textSecondary,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.glass,
    backgroundColor: theme.colors.surface,
  },
  inlineInput: {
    flex: 1,
    height: 54,
    backgroundColor: "transparent",
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: 0,
  },
  currencyPrefix: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    flexShrink: 0,
  },
  amountInput: {
    fontSize: 18,
    fontWeight: "600",
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 28,
    marginBottom: 16,
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  dividerLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: theme.colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  previewWrapper: {
    paddingHorizontal: 24,
  },
  previewCard: {
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  previewLeft: {
    flex: 1,
    gap: 4,
  },
  previewName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  previewAmount: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  cta: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
});

export default CreateTransaction;