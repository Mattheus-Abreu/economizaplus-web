import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
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
  onConfirm: (amount: number) => void;
};

export function PayInvoiceModal({ visible, totalDue, onClose, onConfirm }: Props) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const [value, setValue] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setValue(totalDue.toFixed(2).replace(".", ","));
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [visible, totalDue]);

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const getParsed = () => {
    const parsed = parseFloat(
      value.replace(/\s/g, "").replace(/,/g, ".").replace(/[^0-9.-]/g, "")
    );
    return isNaN(parsed) || parsed <= 0 ? null : Math.min(parsed, totalDue);
  };

  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onClose}>
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
            Fatura atual: <Text style={styles.totalDue}>{formatCurrency(totalDue)}</Text>
          </Text>

          {/* Input */}
          <View style={styles.inputWrap}>
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

          {/* Botões */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => { setValue(totalDue.toFixed(2).replace(".", ",")); }}
            >
              <Text style={styles.buttonTextSecondary}>Pagar total</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, !getParsed() && styles.buttonDisabled]}
              onPress={() => {
                const parsed = getParsed();
                if (!parsed) return;
                onConfirm(parsed);
              }}
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