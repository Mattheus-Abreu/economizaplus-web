import Button from "@/components/Button";
import Input from "@/components/inputs/Input";
import AppModal, { MODAL_HIDDEN, ModalConfig } from "@/components/modal/modal";
import Screen from "@/components/Screen";
import { useCard } from "@/contexts/cardContext";
import { useWallets } from "@/contexts/walletContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Dados ────────────────────────────────────────────────────────────────────

import Dropdown from "@/components/dropdown";

const bancos = [
  { label: "Nubank", value: "nubank" },
  { label: "Cora", value: "cora" },
  { label: "Inter", value: "inter" },
  { label: "Banco do Brasil", value: "bancodobrasil" },
  { label: "Bradesco", value: "bradesco" },
  { label: "Santander", value: "santander" },
  { label: "Caixa", value: "caixa" },
  { label: "BTG Pactual", value: "btg" },
  { label: "Banco XP", value: "xp" },
  { label: "Infinite Pay", value: "infinitepay" },
  { label: "PicPay", value: "picpay" },
  { label: "Mercado Pago", value: "mercadopago" },
  { label: "PagBank", value: "pagbank" },
  { label: "Banco C6", value: "c6" },
  { label: "Digio", value: "digio" },
  { label: "Sicoob", value: "sicoob" },
  { label: "Neon", value: "neon" },
  { label: "Banco Pan", value: "pan" },
  { label: "Banco Safra", value: "safra" },
  { label: "Wise", value: "wise" },
  { label: "PayPal", value: "paypal" },
  { label: "Stripe", value: "stripe" },
  { label: "Stone", value: "stone" },
  { label: "Next", value: "next" },
  { label: "Banco Original", value: "original" },
  { label: "Sicredi", value: "sicredi" },
];

const typesCards = [
  { label: "Crédito", value: "CREDIT" },
  { label: "Débito", value: "DEBIT" },
];

const brandsCards = [
  { label: "Visa", value: "visa" },
  { label: "Mastercard", value: "mastercard" },
  { label: "Elo", value: "elo" },
  { label: "Hipercard", value: "hipercard" },
];

// ─── SelectField ──────────────────────────────────────────────────────────────

type SelectOption = { label: string; value: string };

type SelectFieldProps = {
  label: string;
  placeholder: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  styles: ReturnType<typeof createStyles>;
  theme: ReturnType<typeof useAppTheme>;
};

function SelectField({
  label,
  placeholder,
  options,
  value,
  onChange,
  icon,
  styles,
  theme,
}: SelectFieldProps) {
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Dropdown>
        <Dropdown.Trigger
          style={[styles.fieldInput, value.length > 0 && styles.fieldInputActive]}
        >
          {icon}
          <Text
            style={[
              styles.dropdownText,
              !selected && { color: theme.colors.textSecondary },
            ]}
          >
            {selected ? selected.label : placeholder}
          </Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color={theme.colors.textSecondary}
            style={{ marginLeft: "auto" }}
          />
        </Dropdown.Trigger>
        <Dropdown.Content
          style={{
            backgroundColor: theme.colors.surface,
            borderWidth: 0.5,
            borderColor: theme.colors.glass,
          }}
        >
          <ScrollView
            style={{ maxHeight: 220 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {options.map((option) => (
              <Dropdown.Item
                key={option.value}
                onPress={() => onChange(option.value)}
                style={[
                  styles.dropdownItem,
                  option.value === value && styles.dropdownItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    option.value === value && styles.dropdownItemTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {option.value === value && (
                  <Ionicons name="checkmark" size={16} color={theme.colors.primary} />
                )}
              </Dropdown.Item>
            ))}
          </ScrollView>
        </Dropdown.Content>
      </Dropdown>
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function newCard() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { wallets } = useWallets();
  const { addCard, updateCard } = useCard();
  const [modal, setModal] = useState<ModalConfig>(MODAL_HIDDEN);

  const dataCard = useLocalSearchParams<{
    id?: string;
    nameBank?: string;
    brandBank?: string;
    typeCard?: string;
    lastDigits?: string;
    limitTotal?: string;
    closingDay?: string;
    dueDay?: string;
    walletId?: string;
  }>();

  const isEditing = !!dataCard.id;

  const [nameBank, setNameBank] = useState(dataCard.nameBank || "");
  const [brandBank, setBrandBank] = useState(dataCard.brandBank || "");
  const [typeCard, setTypeCard] = useState(dataCard.typeCard || "");
  const [lastDigits, setLastDigits] = useState(dataCard.lastDigits || "");
  const [limitTotal, setLimitTotal] = useState(dataCard.limitTotal || "");
  const [closingDay, setClosingDay] = useState(dataCard.closingDay || "");
  const [dueDay, setDueDay] = useState(dataCard.dueDay || "");
  const [isLoading, setIsLoading] = useState(false);
  const [walletId, setWalletId] = useState(dataCard.walletId ?? "");

  useEffect(() => {
    if (typeCard !== "CREDIT") setLimitTotal("");
  }, [typeCard]);

  const validateInputs = (): boolean => {
    if (!nameBank.trim()) {
      setModal({ visible: true, variant: "error", title: "Erro", description: "Por favor informe o nome do banco." });
      return false;
    }
    if (!brandBank.trim()) {
      setModal({ visible: true, variant: "error", title: "Erro", description: "Por favor informe a bandeira do cartão." });
      return false;
    }
    if (!lastDigits.trim() || lastDigits.length !== 4 || isNaN(Number(lastDigits))) {
      setModal({ visible: true, variant: "error", title: "Erro", description: "Os últimos 4 dígitos devem ter exatamente 4 números." });
      return false;
    }
    if (!typeCard.trim()) {
      setModal({ visible: true, variant: "error", title: "Erro", description: "Por favor informe o tipo do cartão." });
      return false;
    }
    if (typeCard === "CREDIT") {
      if (!limitTotal.trim() || isNaN(Number(limitTotal.replace(",", ".")))) {
        setModal({ visible: true, variant: "error", title: "Erro", description: "O limite deve ser um número válido." });
        return false;
      }
    }
    if (!closingDay.trim()) {
      setModal({ visible: true, variant: "error", title: "Erro", description: "Por favor informe o dia do fechamento." });
      return false;
    }
    if (!dueDay.trim()) {
      setModal({ visible: true, variant: "error", title: "Erro", description: "Por favor informe o dia do vencimento." });
      return false;
    }
    return true;
  };

  async function saveCard() {
    if (!validateInputs()) return;

    setIsLoading(true);
    try {
      const payload = {
        name: nameBank.trim(),
        brand: brandBank.trim(),
        type: typeCard as "CREDIT" | "DEBIT",
        last4Digits: lastDigits.trim(),
        limitTotal: typeCard === "CREDIT" ? parseFloat(limitTotal.replace(",", ".")) : 0,
        limitRemaining: typeCard === "CREDIT" ? parseFloat(limitTotal.replace(",", ".")) : 0,
        closingDay: parseInt(closingDay, 10),
        dueDay: parseInt(dueDay, 10),
        walletId: walletId || null, // ← adicionar
      };

      if (isEditing && dataCard.id) {
        await updateCard(dataCard.id, payload);
      } else {
        await addCard(payload);
      }

      setModal({
        visible: true,
        variant: "success",
        title: "Sucesso",
        description: isEditing ? "Cartão atualizado com sucesso!" : "Cartão adicionado com sucesso!",
        buttons: [{ label: "OK", onPress: () => { router.back(); setModal(MODAL_HIDDEN); }, variant: "primary" }],
      });
    } catch (error: any) {
      const isDuplicate = error?.response?.status === 409 || error?.message?.toLowerCase().includes("unique");
      setModal({
        visible: true,
        variant: "error",
        title: "Erro",
        description: isDuplicate
          ? "Já existe um cartão com esses últimos 4 dígitos cadastrado."
          : "Ocorreu um erro ao salvar o cartão. Tente novamente.",
        buttons: [{ label: "OK", onPress: () => setModal(MODAL_HIDDEN), variant: "primary" }],
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Screen style={{ padding: 0 }}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: "padding" })}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <FontAwesome name="arrow-left" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroLabel}>
              {isEditing ? "Editar cartão" : "Novo cartão"}
            </Text>
            <Text style={styles.heroTitle}>
              {isEditing ? "Edite seu\ncartão" : "Adicione um\nnovo cartão"}
            </Text>
            <Text style={styles.heroSub}>
              {isEditing
                ? "Atualize as informações do seu cartão"
                : "Preencha os dados do seu cartão bancário"}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <SelectField
              label="Banco"
              placeholder="Selecione um banco"
              options={bancos}
              value={nameBank}
              onChange={setNameBank}
              styles={styles}
              theme={theme}
            />

            <SelectField
              label="Bandeira do cartão"
              placeholder="Selecione a bandeira"
              options={brandsCards}
              value={brandBank}
              onChange={setBrandBank}
              styles={styles}
              theme={theme}
            />

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Últimos 4 dígitos</Text>
              <View style={[styles.fieldInput, lastDigits.length > 0 && styles.fieldInputActive]}>
                <Ionicons name="card" size={18} color={lastDigits.length > 0 ? theme.colors.primary : "#94A3B8"} />
                <Input
                  style={styles.inlineInput}
                  placeholder="Digite os últimos 4 dígitos"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={lastDigits}
                  onChangeText={(text) => setLastDigits(text.replace(/\D/g, "").slice(0, 4))}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Tipo do cartão</Text>
              <View style={styles.typeContainer}>
                {typesCards.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setTypeCard(typeCard === option.value ? "" : option.value)}
                    style={[
                      styles.typeButton,
                      typeCard === option.value && styles.typeButtonActive,
                    ]}
                  >
                    <Text style={{ color: typeCard === option.value ? "#fff" : theme.colors.text }}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Escolha uma carteira</Text>
              <View style={styles.typeContainer}>
                {(wallets ?? []).length === 0 ? (
                  <Text style={styles.emptyField}>Nenhuma carteira cadastrada</Text>
                ) : (
                  (wallets ?? []).map((w) => (
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

            {typeCard === "CREDIT" && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Limite do cartão</Text>
                <View style={[styles.fieldInput, limitTotal.length > 0 && styles.fieldInputActive]}>
                  <Ionicons name="cash-outline" size={18} color={limitTotal.length > 0 ? theme.colors.primary : "#94A3B8"} />
                  <Text style={styles.currencyPrefix}>R$</Text>
                  <Input
                    style={[styles.inlineInput, styles.amountInput]}
                    placeholder="0"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={limitTotal}
                    onChangeText={(text) => setLimitTotal(text.replace(/[^0-9,]/g, ""))}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Dia de fechamento</Text>
              <View style={[styles.fieldInput, closingDay.length > 0 && styles.fieldInputActive]}>
                <Ionicons name="calendar-outline" size={18} color={closingDay.length > 0 ? theme.colors.primary : "#94A3B8"} />
                <Input
                  style={styles.inlineInput}
                  placeholder="Ex: 05"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={closingDay}
                  onChangeText={(text) => setClosingDay(text.replace(/\D/g, "").slice(0, 2))}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Dia de vencimento</Text>
              <View style={[styles.fieldInput, dueDay.length > 0 && styles.fieldInputActive]}>
                <Ionicons name="calendar" size={18} color={dueDay.length > 0 ? theme.colors.primary : "#94A3B8"} />
                <Input
                  style={styles.inlineInput}
                  placeholder="Ex: 10"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={dueDay}
                  onChangeText={(text) => setDueDay(text.replace(/\D/g, "").slice(0, 2))}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
            </View>
          </View>

          <View style={styles.cta}>
            <Button
              label={isEditing ? "Atualizar cartão" : "Adicionar cartão"}
              onPress={saveCard}
              disabled={isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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

// ─── Estilos ──────────────────────────────────────────────────────────────────

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
      marginTop: 4,
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
    dropdownText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text,
    },
    dropdownItem: {
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderBottomWidth: 0.5,                     
      borderBottomColor: theme.colors.border,
    },
    dropdownItemActive: {
      backgroundColor: theme.colors.surface,
    },
    dropdownItemText: {
      fontSize: 14,
      color: theme.colors.text,
    },
    dropdownItemTextActive: {
      color: theme.colors.primary,
      fontWeight: "600",
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
    cta: {
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 32,
    },
  });