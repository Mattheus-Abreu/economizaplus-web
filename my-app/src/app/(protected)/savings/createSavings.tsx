import theme from "@/app/themes/theme";
import Button from "@/components/Button";
import Screen from "@/components/Screen";
import { CircularProgress } from "@/components/circular-progress";
import Input from "@/components/inputs/Input";
import { useGoals } from "@/contexts/goalContext";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { BaseButton } from "react-native-gesture-handler";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Easing, useSharedValue, withTiming } from "react-native-reanimated";
import { useWallets } from "@/contexts/walletContext";
import { useSaving } from "@/contexts/savingContext";

function createSavings() {
  const router = useRouter();
  const { addSaving } = useSaving();
  const { wallets } = useWallets();
  const { goals } = useGoals();

  const params = useLocalSearchParams<{
    id?: string;
    goalId?: string;
    goalName?: string;
    walletId?: string;
    amount?: string;
  }>();

  const isEditing = !!params.id;

  const [goalId, setGoalId] = useState(params.goalId ?? "");
  const [walletId, setWalletId] = useState(params.walletId ?? "");
  const [amount, setAmount] = useState(params.amount ?? "");
  const [createdAt, setCreatedAt] = useState(new Date().toISOString());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const progress = useSharedValue(0);

  const selectedGoal = goals.find((g) => g.id === goalId);

  useEffect(() => {
    if (!selectedGoal) {
        progress.value = withTiming(0, { duration: 400 });
        return;
    }

    const current = Number(selectedGoal.currentAmount);
    const target = Number(selectedGoal.targetAmount);
    const deposit = Number(amount) || 0;

    const currentWithDeposit = current + deposit;

    const percent =
        target > 0
        ? Math.min((currentWithDeposit / target) * 100, 100)
        : 0;

    progress.value = withTiming(percent, {
        duration: 800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    }, [goalId, amount, selectedGoal]);

  function formatDisplayDate(iso: string): string {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("pt-BR");
  }

  function formatAmount(value: string): string {
    const num = parseFloat(value);
    if (isNaN(num)) return "–";
    return num.toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  function getProgressPercent(): number {
    if (!selectedGoal) return 0;

    const current = Number(selectedGoal.currentAmount);
    const target = Number(selectedGoal.targetAmount);
    const deposit = Number(amount) || 0;

    return Math.min(
        Math.round(((current + deposit) / target) * 100),
        100
    );
    }

  async function handleSubmit() {
    if (!walletId || !goalId || !amount) {
      Alert.alert("Atenção", "Selecione a carteira, a meta e informe o valor.");
      return;
    }

    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Atenção", "Informe um valor válido para o depósito.");
      return;
    }

    const selectedWallet = wallets.find(w => w.id === walletId);

    if (!selectedWallet) {
      Alert.alert("Erro", "Carteira não encontrada.");
      return;
    }

    if (numAmount > selectedWallet.balance) {
      Alert.alert(
        "Saldo insuficiente",
        "Você não possui saldo suficiente na carteira para esse depósito."
      );
      return;
    }

    try {
      const { isCompleted, goalName } = await addSaving({
        goalId,
        walletId,
        amount: numAmount,
        createdAt,
      });
      if (isCompleted) {
        Alert.alert(
          "🎉 Meta concluída!",
          `Parabéns! Você atingiu 100% da sua meta "${goalName}". Continue assim!`,
          [{ text: "Ótimo!", onPress: () => router.back() }]
        );
      } else {
        Alert.alert("Sucesso", "Depósito realizado com sucesso!");
        router.back();
      }
    } catch (error: any) {
      console.log(error);
      Alert.alert("Erro", error.message || "Erro ao realizar depósito!");
    }
  }

  return (
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
            {isEditing ? "Editar depósito" : "Novo depósito"}
          </Text>
          <Text style={styles.heroTitle}>
            {params.goalName
              ? `Depositar em\n"${params.goalName}"`
              : "Quanto você\nquer depositar?"}
          </Text>
          <Text style={styles.heroSub}>
            O valor será debitado da carteira selecionada e adicionado à meta
          </Text>
        </View>

        <View style={styles.form}>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Valor do depósito</Text>
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
            <Text style={styles.fieldLabel}>Debitar da carteira</Text>
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

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Meta</Text>
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
                    <Text style={{ color: goalId === g.id ? "#fff" : theme.colors.text }}>
                      {g.name}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Data do depósito</Text>
            <BaseButton onPress={() => setShowDatePicker(true)}>
              <View style={[styles.fieldInput, styles.fieldInputActive]}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={theme.colors.primary}
                />
                <Text style={styles.dateText}>{formatDisplayDate(createdAt)}</Text>
              </View>
            </BaseButton>
          </View>

        </View>

        <DateTimePickerModal
          date={new Date(createdAt)}
          isVisible={showDatePicker}
          locale="pt-BR"
          mode="date"
          onConfirm={(date) => {
            setCreatedAt(date.toISOString());
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
                {selectedGoal?.name || params.goalName || "Selecione uma meta"}
              </Text>
              <Text style={styles.previewAmount}>
                Depósito: R$ {formatAmount(amount) || "–"}
              </Text>
              {selectedGoal && (
                <Text style={styles.previewAmount}>
                    Após depósito: R${" "}
                    {(
                    Number(selectedGoal.currentAmount) + (Number(amount) || 0)
                    ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}{" "}
                    de R${" "}
                    {Number(selectedGoal.targetAmount).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    })}{" "}
                    ({getProgressPercent()}%)
                </Text>
                )}
            </View>
            <CircularProgress
              progress={progress}
              size={52}
              strokeWidth={4}
              outerCircleColor="rgba(255,255,255,0.2)"
              progressCircleColor="#ffffff"
              backgroundColor="rgba(0,0,0,0.1)"
            />
          </LinearGradient>
        </View>

        <View style={styles.cta}>
          <Button
            label={isEditing ? "Salvar alterações" : "Realizar depósito"}
            onPress={handleSubmit}
          />
        </View>
      </ScrollView>
    </Screen>
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
    gap: 16,
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

export default createSavings;