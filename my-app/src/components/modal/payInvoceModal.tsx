import { useWallets } from "@/contexts/walletContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  totalDue: number;
  onClose: () => void;
  onConfirm: (amount: number, walletId: string) => void;
};

export function PayInvoiceModal({ visible, totalDue, onClose, onConfirm }: Props) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { wallets } = useWallets();
  const [value, setValue] = useState("");
  const [walletId, setWalletId] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setValue(totalDue.toFixed(2).replace(".", ","));
      setWalletId(wallets?.[0]?.id ?? "");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [visible, totalDue, wallets]);

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const getParsed = () => {
    const parsed = parseFloat(
      value.replace(/\s/g, "").replace(/,/g, ".").replace(/[^0-9.-]/g, "")
    );
    return isNaN(parsed) || parsed <= 0 ? null : Math.min(parsed, totalDue);
  };

  const selectedWallet = wallets?.find((w) => w.id === walletId);
  const walletBalance = Number(selectedWallet?.balance ?? 0);
  const parsed = getParsed();
  const hasInsufficientBalance = !!parsed && parsed > walletBalance;
  const canConfirm = !!parsed && !!walletId && !hasInsufficientBalance;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: "height" })}
          style={{ width: "100%" }}
        >
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>

            {/* Ícone */}
            <View style={styles.iconWrap}>
              <Ionicons name="cash-outline" size={36} color="#22C55E" />
            </View>

            <Text style={styles.title}>Pagar fatura</Text>
            <Text style={styles.description}>
              Fatura atual:{" "}
              <Text style={styles.totalDue}>{formatCurrency(totalDue)}</Text>
            </Text>

            {/* Seleção de carteira */}
            <View style={styles.walletSection}>
              <Text style={styles.sectionLabel}>Debitar de</Text>
              {(wallets ?? []).length === 0 ? (
                <Text style={styles.emptyWallets}>Nenhuma carteira cadastrada</Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.walletList}
                >
                  {(wallets ?? []).map((w) => (
                    <TouchableOpacity
                      key={w.id}
                      onPress={() => setWalletId(w.id)}
                      style={[
                        styles.walletBtn,
                        walletId === w.id && styles.walletBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.walletBtnText,
                          walletId === w.id && styles.walletBtnTextActive,
                        ]}
                      >
                        {w.name}
                      </Text>
                      <Text
                        style={[
                          styles.walletBtnBalance,
                          walletId === w.id && styles.walletBtnTextActive,
                        ]}
                      >
                        {Number(w.balance).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Input de valor */}
            <View
              style={[
                styles.inputWrap,
                hasInsufficientBalance && styles.inputWrapError,
              ]}
            >
              <Text style={styles.inputPrefix}>R$</Text>
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={value}
                onChangeText={setValue}
                keyboardType="numeric"
                placeholderTextColor={theme.colors.textSecondary}
                selectTextOnFocus
              />
            </View>

            {/* Aviso de saldo insuficiente */}
            {hasInsufficientBalance && (
              <Text style={styles.insufficientWarning}>
                Saldo insuficiente na carteira selecionada
              </Text>
            )}

            {/* Botões */}
            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => setValue(totalDue.toFixed(2).replace(".", ","))}
              >
                <Text style={styles.buttonTextSecondary}>Pagar total</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonPrimary,
                  !canConfirm && styles.buttonDisabled,
                ]}
                onPress={() => {
                  const parsed = getParsed();
                  if (!parsed || !walletId) return;
                  onConfirm(parsed, walletId);
                }}
                disabled={!canConfirm}
              >
                <Text style={styles.buttonTextPrimary}>Confirmar</Text>
              </TouchableOpacity>
            </View>

          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    card: {
      width: "100%",
      maxWidth: 360,
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 24,
      alignItems: "center",
      gap: 12,
    },
    iconWrap: {
      width: 72,
      height: 72,
      borderRadius: 20,
      backgroundColor: "#22C55E18",
      borderWidth: 1,
      borderColor: "#22C55E40",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    title: {
      fontSize: theme.fontSize.title,
      fontWeight: "700",
      color: theme.colors.text,
    },
    description: {
      fontSize: theme.fontSize.text,
      color: theme.colors.textSecondary,
    },
    totalDue: {
      color: theme.colors.text,
      fontWeight: "700",
    },
    walletSection: {
      width: "100%",
      gap: 8,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    walletList: {
      gap: 8,
      flexDirection: "row",
    },
    walletBtn: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: theme.colors.glass,
      backgroundColor: theme.colors.background,
      alignItems: "center",
      gap: 2,
    },
    walletBtnActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    walletBtnText: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    walletBtnTextActive: {
      color: "#fff",
    },
    walletBtnBalance: {
      fontSize: 11,
      color: theme.colors.textSecondary,
    },
    emptyWallets: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    inputWrap: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      backgroundColor: theme.colors.background,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 16,
      marginTop: 4,
    },
    inputWrapError: {
      borderColor: "#EF4444",
    },
    inputPrefix: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      marginRight: 6,
    },
    input: {
      flex: 1,
      height: 52,
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.text,
    },
    insufficientWarning: {
      fontSize: 12,
      color: "#EF4444",
      alignSelf: "flex-start",
      marginTop: -4,
    },
    buttonsRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 8,
      width: "100%",
    },
    button: {
      flex: 1,
      height: 54,
      borderRadius: 16,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonPrimary: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    buttonTextPrimary: {
      color: theme.colors.primaryForeground,
      fontSize: theme.fontSize.text,
      fontWeight: "600",
    },
    buttonSecondary: {
      backgroundColor: "transparent",
      borderColor: theme.colors.border,
    },
    buttonTextSecondary: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSize.text,
      fontWeight: "600",
    },
    buttonDisabled: {
      opacity: 0.4,
    },
  });