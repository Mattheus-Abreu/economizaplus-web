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

function createGoal() {
  const router = useRouter();
  const { addGoal, updateGoal } = useGoals();
  const { wallets } = useWallets();

  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    description?: string;
    walletId?: string;
    targetAmount?: string;
    currentAmount?: string;
    deadline?: string;
  }>();

  const isEditing = !!params.id;

  const [name, setName] = useState(params.name ?? "");
  const [description, setDescription] = useState(params.description ?? "");
  const [walletId, setWalletId] = useState(params.walletId ?? "");
  const [targetAmount, setTargetAmount] = useState(params.targetAmount ?? "");
  const [currentAmount, setCurrentAmount] = useState(params.currentAmount ?? "");
  const [walletId, setWalletId] = useState(params.walletId ?? "");
  const [deadline, setDeadline] = useState(
    params.deadline ?? new Date().toISOString()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {wallets} = useWallets();

  const progress = useSharedValue(0);

  useEffect(() => {
  const current = parseFloat(currentAmount);
  const target = parseFloat(targetAmount);

  if (!current || !target || target <= 0) {
    progress.value = withTiming(0, { duration: 600 });
    return;
  }

  const percent = Math.min((current / target) * 100, 100);
  progress.value = withTiming(percent, {
    duration: 800,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });
}, [currentAmount, targetAmount]);

  function formatDisplayDate(iso: string): string {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("pt-BR");
  }

  function getDaysRemaining(iso: string): string {
    const date = new Date(iso);
    const today = new Date();
    const diff = Math.ceil(
      (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff < 0) return "Expirado";
    if (diff === 0) return "Hoje";
    return `${diff} dias`;
  }

  function formatAmount(value: string): string {
    const num = parseFloat(value);
    if (isNaN(num)) return "–";
    return num.toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  async function handleSubmit() {
    if (!name.trim() || !targetAmount || !deadline) {
      return Alert.alert("Atenção", "Preencha todos os campos!");
    }

    try {
      if (isEditing) {
        await updateGoal(params.id!, {
          name,
          targetAmount: Number(targetAmount),
          currentAmount: Number(currentAmount),
          deadline,
        });
        Alert.alert("Sucesso", "Meta atualizada com sucesso!");
      } else {
        await addGoal({
          name,
          targetAmount: Number(targetAmount),
          currentAmount: Number(currentAmount),
          deadline,
        });
        Alert.alert("Sucesso", "Meta criada com sucesso!");
      }
      router.back();
    } catch (error: any) {
      console.log(error);
      Alert.alert("Erro", error.message || "Erro ao salvar meta!");
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
            {isEditing ? "Editar meta" : "Nova meta"}
          </Text>
          <Text style={styles.heroTitle}>
            {isEditing
              ? "Redefina seu\nsobjetivo"
              : "Qual é o seu\npróximo objetivo?"}
          </Text>
          <Text style={styles.heroSub}>
            {isEditing
              ? "Atualize os dados da sua meta"
              : "Defina uma meta e acompanhe seu progresso"}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Nome da meta</Text>
            <View style={[styles.fieldInput, name.length > 0 && styles.fieldInputActive]}>
              <Ionicons
                name="pencil-outline"
                size={18}
                color={name.length > 0 ? theme.colors.primary : "#94A3B8"}
              />
              <Input
                style={styles.inlineInput}
                placeholder="Ex: Viagem para Europa"
                placeholderTextColor={theme.colors.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Descrição</Text>
            <View style={[styles.fieldInput, description.length > 0 && styles.fieldInputActive]}>
              <Ionicons
                name="pencil-outline"
                size={18}
                color={description.length > 0 ? theme.colors.primary : "#94A3B8"}
              />
              <Input
                style={styles.inlineInput}
                placeholder="Ex: Viajar para Europa no próximo verão"
                placeholderTextColor={theme.colors.textSecondary}
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>

          <View style={styles.field}>
              <Text style={styles.fieldLabel}>Escolha uma carteira</Text>
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
                        <Text
                          style={{
                            color: walletId === w.id ? "#fff" : theme.colors.text,
                          }}
                        >
                          {w.name}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
            </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Valor alvo</Text>
            <View style={[styles.fieldInput, targetAmount.length > 0 && styles.fieldInputActive]}>
              <Ionicons
                name="cash-outline"
                size={18}
                color={targetAmount.length > 0 ? theme.colors.primary : "#94A3B8"}
              />
              <Text style={styles.currencyPrefix}>R$</Text>
              <Input
                style={[styles.inlineInput, styles.amountInput]}
                placeholder="0"
                placeholderTextColor={theme.colors.textSecondary}
                value={targetAmount}
                onChangeText={setTargetAmount}
                keyboardType="numeric"
              />
          </View>

          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Prazo</Text>
            <BaseButton onPress={() => setShowDatePicker(true)}>
              <View style={[styles.fieldInput, styles.fieldInputActive]}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={theme.colors.primary}
                />
                <Text style={styles.dateText}>{formatDisplayDate(deadline)}</Text>
                <View style={styles.daysBadge}>
                  <Text style={styles.daysBadgeText}>{getDaysRemaining(deadline)}</Text>
                </View>
              </View>
            </BaseButton>
          </View>
        </View>

        <DateTimePickerModal
          date={new Date(deadline)}
          isVisible={showDatePicker}
          locale="pt-BR"
          mode="date"
          onConfirm={(date) => {
            setDeadline(date.toISOString());
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
                {name || "Nome da meta"}
              </Text>
              <Text style={styles.previewAmount}>
                Meta: R$ {formatAmount(targetAmount) || "–"} ·{" "}
                {new Date(deadline).toLocaleDateString("pt-BR", {
                  month: "short",
                  year: "numeric",
                })}
              </Text>
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
            label={isEditing ? "Salvar alterações" : "Criar meta"}
            onPress={handleSubmit}
          >
          </Button>
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
    gap: 12,
    marginTop: 8,
  },
  typeButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  typeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  emptyField: {
    fontSize: 14,
    color: theme.colors.textSecondary,
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

export default createGoal;