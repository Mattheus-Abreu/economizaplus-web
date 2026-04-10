import theme from "@/app/themes/theme";
import Button from "@/components/Button";
import Screen from "@/components/Screen";
import { CircularProgress } from "@/components/circular-progress";
import Input from "@/components/inputs/Input";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { BaseButton } from "react-native-gesture-handler";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { useTransactions } from "@/contexts/transactionContext";
import { useGoals } from "@/contexts/goalContext";
import { useCategory } from "@/contexts/categoryContext";

type PaymentMethod = "Dinheiro" | "Cartão" | "Pix" | "Transferencia" 
type TransactionType = "Entrada" | "Saída"
type isInstallmentType = "Sim" | "Não"
type CardType = "Crédito" | "Débito"

function CreateTransaction() {
  const router = useRouter();
  const { addTransaction , updateTransaction } = useTransactions();

  const params = useLocalSearchParams<{
    id?: string;
    type?: TransactionType;
    paymentMethod?: PaymentMethod;
    card?: CardType;
    interestRate?: string;
    amount?: string;
    description?: string;
    transactionDate?: string;
    goalId?: string;
    categoryId?: string;
    isInstallment?: isInstallmentType;
    installmentNumber?: string;
    installmentTotal?: string;
  }>();

  const isEditing = !!params.id;

  const [type, setType] = useState(params.type ?? "");
  const [paymentMethod, setPaymentMethod] = useState(params.paymentMethod ?? "");
  const [card, setCard] = useState(params.card ?? "");
  const [amount, setAmount] = useState(params.amount ?? "");
  const [description, setDescription] = useState(params.description ?? "");
  const [transactionDate, setTransactionDate] = useState(params.transactionDate ?? "");
  const [goalId, setGoalId] = useState(params.goalId ?? "");
  const [categoryId, setCategoryId] = useState(params.categoryId ?? "");
  const [isInstallment, setIsInstallment] = useState(params.isInstallment ?? "");
  const [installmentNumber, setInstallmentNumber] = useState(params.installmentNumber ?? "");
  const [installmentTotal, setInstallmentTotal] = useState(params.installmentTotal ?? "");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const progress = useSharedValue(0);

  const types: TransactionType[] = [
    "Entrada",
    "Saída",
  ];

  const payments: PaymentMethod[] = [
    "Dinheiro",
    "Cartão",
    "Pix",
    "Transferencia",
  ];

  const installments: isInstallmentType[] = [
    "Sim",
    "Não",
  ];

  const cardTypes: CardType[] = [
    "Crédito",
    "Débito",
  ];

  const { goals } = useGoals();
  const { categories } = useCategory();


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
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("pt-BR");
  }

  function calculateInstallmentValue() {
  const principal = Number(amount);
  const numInstallments = Number(installmentNumber);

  if (!principal || !numInstallments || numInstallments <= 0) return 0;

  return principal / numInstallments;
}

function calculateTotal() {
  return Number(amount) || 0;
}

  async function handleSubmit() {
    const installmentBool = isInstallment === "Sim";

    try {
      if (isEditing) {
        await updateTransaction(params.id!, {
          type,
          targetAmount: Number(amount),
          currentAmount: Number(amount),
          transactionDate,
        });
        Alert.alert("Sucesso", "Transação atualizada com sucesso!");
      } else {
        await addTransaction({
          type,
          paymentMethod,
          amount: Number(amount),
          description,
          transactionDate,
          goalId,
          categoryId,
          isInstallment: installmentBool,
          installmentNumber: Number(installmentNumber),
          installmentTotal: Number(installmentTotal),
        });
        Alert.alert("Sucesso", "transação criada com sucesso!");
      }
      router.back();
    } catch (error: any) {
      console.log(error);
      Alert.alert("Erro", error.message || "Erro ao salvar transação!");
    }
  }

  const CATEGORIES = [
    {name: "Alimentação", id: 1},
    {name: "Lazer", id: 2},
    {name: "Trabalho", id: 3},
    {name: "Transporte", id: 4},
    {name: "Saude", id: 5},
    {name: "Outros", id: 6},
  ]

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
                ? "Redefina seu\nsobjetivo"
                : "Qual é o seu\npróximo objetivo?"}
            </Text>
            <Text style={styles.heroSub}>
              {isEditing
                ? "Atualize os dados da sua transação"
                : "Defina uma transação"}
            </Text>
          </View>

          
          <View style={styles.form}>

            
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Tipo de transação</Text>
                <View style={styles.typeContainer}>
                  {types.map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setType(t)}
                      style={[
                        styles.typeButton,
                        type === t && styles.typeButtonActive,
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            type === t ? "#fff" : theme.colors.text,
                        }}
                      >
                        {t}
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
              <Text style={styles.fieldLabel}>Método de pagamento</Text>
                <View style={styles.typeContainer}>
                  {payments.map((p) => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setPaymentMethod(p)}
                      style={[
                        styles.typeButton,
                        paymentMethod === p && styles.typeButtonActive,
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            paymentMethod === p ? "#fff" : theme.colors.text,
                        }}
                      >
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </View>
            {paymentMethod === "Cartão" && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Tipo do cartão</Text>
                  <View style={styles.typeContainer}>
                    {cardTypes.map((c) => (
                      <TouchableOpacity
                        key={c}
                        onPress={() => setCard(c)}
                        style={[
                          styles.typeButton,
                          card === c && styles.typeButtonActive,
                        ]}
                      >
                        <Text
                          style={{
                            color:
                              card === c ? "#fff" : theme.colors.text,
                          }}
                        >
                          {c}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>
            )}
            {paymentMethod === "Cartão" && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Pagou parcelado?</Text>
                  <View style={styles.typeContainer}>
                    {installments.map((i) => (
                      <TouchableOpacity
                        key={i}
                        onPress={() => setIsInstallment(i)}
                        style={[
                          styles.typeButton,
                          isInstallment === i && styles.typeButtonActive,
                        ]}
                      >
                        <Text
                          style={{
                            color:
                              isInstallment === i ? "#fff" : theme.colors.text,
                          }}
                        >
                          {i}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>
            )}

            {isInstallment === "Sim" && (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Número de parcelas</Text>
                  <View style={[styles.fieldInput, installmentNumber.length > 0 && styles.fieldInputActive]}>
                    <Ionicons
                      name="card-sharp"
                      size={18}
                      color={installmentNumber.length > 0 ? theme.colors.primary : "#94A3B8"}
                    />
                    <Input
                      style={styles.inlineInput}
                      placeholder="Ex.: 12 vezes"
                      placeholderTextColor={theme.colors.textSecondary}
                      keyboardType="numeric"
                      value={installmentNumber}
                      onChangeText={setInstallmentNumber}
                    />
                  </View>
                </View>
              )}

              {isInstallment === "Sim" && (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Valor das parcelas</Text>
                  <View style={[styles.fieldInput, styles.fieldInputActive]}>
                    <Ionicons
                      name="cash-outline"
                      size={18}
                      color={theme.colors.primary}
                    />
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 16 }}>
                    {installmentNumber
                      ? `${installmentNumber}x de R$ ${formatAmount(String(calculateInstallmentValue()))}`
                      : ""}
                  </Text>
                  </View>
                </View>
              )}
            
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Quando foi feita?</Text>
              <BaseButton onPress={() => setShowDatePicker(true)}>
                <View style={[styles.fieldInput, styles.fieldInputActive]}>
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.dateText}>{formatDisplayDate(transactionDate)}</Text>
                </View>
              </BaseButton>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Escolha uma meta</Text>
                <View style={styles.typeContainer}>
                  {goals.length === 0 ? (
                    <Text style={styles.emptyField}>Nenhuma meta cadastrada</Text>
                  ) : (
                    goals.map((g) => (
                      <TouchableOpacity
                        key={g.id}
                        onPress={() => setGoalId(g.id)}
                        style={[
                          styles.typeButton,
                          goalId === g.id && styles.typeButtonActive,
                        ]}
                      >
                        <Text
                          style={{
                            color: goalId === g.id ? "#fff" : theme.colors.text,
                          }}
                        >
                          {g.name}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
            </View>
            
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Escolha uma categoria</Text>
                <View style={styles.typeContainer}>
                  {CATEGORIES.length === 0 ? (
                    <Text style={styles.emptyField}>Nenhuma categoria cadastrada</Text>
                  ) : (
                    CATEGORIES.map((c) => (
                      <TouchableOpacity
                        key={c.name}
                        onPress={() => setCategoryId (c.name)}
                        style={[
                          styles.typeButton,
                          categoryId === c.name && styles.typeButtonActive,
                        ]}
                      >
                        <Text
                          style={{
                            color: categoryId === c.name ? "#fff" : theme.colors.text,
                          }}
                        >
                          {c.name}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Adicione uma descrição</Text>
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
              colors={["#7C3AED", "#A78BFA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.previewCard}
            >
              <View style={styles.previewLeft}>
                <Text style={styles.previewName} numberOfLines={1}>
                  {type || "Tipo da transação"}
                </Text>
                <Text style={styles.previewAmount}>
                  Transação de: R$ {formatAmount(amount) || "–"} ·{" "}
                  {new Date(transactionDate).toLocaleDateString("pt-BR", {
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </LinearGradient>
          </View>

        
          <View style={styles.cta}>
            <Button
              label={isEditing ? "Salvar alterações" : "Criar transação"}
              onPress={handleSubmit}
            >
            </Button>
          </View>
        </ScrollView>
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
  },
  emptyField:{
    color: theme.colors.text,
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
  daysBadge: {
    backgroundColor: "rgba(124,58,237,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  daysBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.primary,
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
    marginRight: 16,
  },
  previewName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  previewAmount: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },
  cta: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
});

export default CreateTransaction;