import Button from "@/components/Button";
import Screen from "@/components/Screen";
import Input from "@/components/inputs/Input";
import AppModal, { MODAL_HIDDEN, ModalConfig } from "@/components/modal/modal";
import { useWallets } from "@/contexts/walletContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

type WalletType = "CASH" | "INVESTMENT" | "SAVINGS_ACCOUNT" | "CHECKING_ACCOUNT" | "GOAL";

function createWallet() {
  const router = useRouter();
  const { addWallet, updateWallet } = useWallets();
  const [modal, setModal] = useState<ModalConfig>(MODAL_HIDDEN);
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const params = useLocalSearchParams();

  const {
    id,
    name: paramName,
    type: paramType,
    balance: paramBalance,
  } = params as {
    id?: string;
    name?: string;
    type?: WalletType;
    balance?: string;
  };

  const isEditing = !!id;

  const [name, setName] = useState(paramName ?? "");
  const [type, setType] = useState<WalletType | "">(paramType ?? "");
  const [balance, setBalance] = useState(
    paramBalance ? String(paramBalance) : ""
  );

const walletTypes: { id: WalletType; name: string }[] = [
  { id: "CHECKING_ACCOUNT", name: "Corrente" },
  { id: "SAVINGS_ACCOUNT", name: "Poupança" },
  { id: "CASH", name: "Dinheiro" },
  { id: "INVESTMENT", name: "Investimento" },
  { id: "GOAL", name: "Caixinha" },
];

  function formatAmount(value: string): string {
    const num = parseFloat(value);
    if (isNaN(num)) return "–";
    return num.toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  async function handleSubmit() {
    if (!name.trim() || !type || !balance) {
      return setModal({
        visible: true,
        variant: "warning",
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos para continuar."
      })
    }

    try {
      if (isEditing) {
        await updateWallet(id!, {
          name,
          type,
          balance: Number(balance),
        });
        setModal({
          visible: true,
          variant: "success",
          title: "Sucesso",
          description: "Cateira atualizada com sucesso!"
        })
      } else {
        await addWallet({
          name,
          type,
          balance: Number(balance),
        });
        setModal({
          visible: true,
          variant: "success",
          title: "Sucesso",
          description: "Carteira criada com sucesso!"
        })
      }

      router.back();
    } catch (error: any) {
      console.log(error);
      setModal({
        visible: true,
        variant: "error",
        title: "Erro",
        description: error.message || `Ocorreu um erro ao ${isEditing ? "atualizar" : "criar"} a carteira.`
      })
    }
  }

  return (
    <Screen style={{ padding: 0 }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: "padding" })}
          >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>
            {isEditing ? "Editar carteira" : "Nova carteira"}
          </Text>

          <Text style={styles.heroTitle}>
            {isEditing
              ? "Redefina seu objetivo"
              : "Qual é o seu próximo objetivo?"}
          </Text>

          <Text style={styles.heroSub}>
            {isEditing
              ? "Atualize os dados da sua carteira"
              : "Defina uma carteira e acompanhe seu progresso"}
          </Text>
        </View>

        <View style={styles.form}>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Nome da carteira</Text>
            <View
              style={[
                styles.fieldInput,
                name.length > 0 && styles.fieldInputActive,
              ]}
            >
              <Ionicons
                name="pencil-outline"
                size={18}
                color={
                  name.length > 0 ? theme.colors.primary : "#94A3B8"
                }
              />

              <Input
                style={styles.inlineInput}
                placeholder="Ex: Carteira de Investimentos"
                placeholderTextColor={theme.colors.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Escolha um tipo</Text>

            <View style={styles.typeContainer}>
              {walletTypes.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setType(t.id)}
                  style={[
                    styles.typeButton,
                    type === t.id && styles.typeButtonActive,
                  ]}
                >
                  <Text
                    style={{
                      color:
                        type === t.id ? "#fff" : theme.colors.text,
                    }}
                  >
                    {t.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Saldo inicial</Text>

            <View
              style={[
                styles.fieldInput,
                balance.length > 0 && styles.fieldInputActive,
              ]}
            >
              <Ionicons
                name="cash-outline"
                size={18}
                color={
                  balance.length > 0
                    ? theme.colors.primary
                    : "#94A3B8"
                }
              />

              <Text style={styles.currencyPrefix}>R$</Text>

              <Input
                style={[styles.inlineInput, styles.amountInput]}
                placeholder="0"
                placeholderTextColor={theme.colors.textSecondary}
                value={balance}
                onChangeText={setBalance}
                keyboardType="numeric"
              />
            </View>
          </View>
                 
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
                {name || "Nome da carteira"} • {walletTypes.find((t) => t.id === type)?.name || "tipo"}
              </Text>

              <Text style={styles.previewAmount}>
                R$ {formatAmount(balance)}
              </Text>
            </View>
          </LinearGradient>
          </View>

          <View style={styles.cta}>
            <Button
              label={
                isEditing
                  ? "Salvar alterações"
                  : "Criar carteira"
              }
              onPress={handleSubmit}
            />
          </View>
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
        </KeyboardAvoidingView>
    </Screen>
  );
}


const createStyles = (theme: ReturnType<typeof useAppTheme>) => 
StyleSheet.create({
  header: {
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 4,
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
   emptyField:{
    color: theme.colors.text,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.glass,
    backgroundColor: theme.colors.surface,
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
    paddingHorizontal: 0,
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

    paddingTop: 20,
    paddingBottom: 32,
  },
});

export default createWallet;