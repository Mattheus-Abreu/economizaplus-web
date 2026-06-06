import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type IconName = React.ComponentProps<typeof Ionicons>["name"];
type ModalVariant = "success" | "error" | "warning" | "info" | "confirm";

type ModalButton = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "danger";
};

type AppModalProps = {
  visible: boolean;
  onClose: () => void;
  variant?: ModalVariant;
  title: string;
  description?: string;
  buttons?: ModalButton[];
  dismissible?: boolean;
};

const VARIANTS: Record<
  ModalVariant,
  { icon: IconName; color: string }
> = {
  success: { icon: "checkmark-circle", color: "#22C55E" },
  error:   { icon: "close-circle",     color: "#E05C7A" },
  warning: { icon: "warning",          color: "#FCA370" },
  info:    { icon: "information-circle", color: "#5DA8D4" },
  confirm: { icon: "help-circle",      color: "#7C3AED" },
};

function AppModal({
  visible,
  onClose,
  variant = "info",
  title,
  description,
  buttons,
  dismissible = true,
}: AppModalProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const config = VARIANTS[variant];

  const resolvedButtons: ModalButton[] =
    buttons && buttons.length > 0
      ? buttons
      : variant === "confirm"
      ? [
          { label: "Cancelar",  variant: "secondary", onPress: onClose },
          { label: "Confirmar", variant: "primary",   onPress: onClose },
        ]
      : [{ label: "OK", variant: "primary", onPress: onClose }];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        style={styles.overlay}
        onPress={dismissible ? onClose : undefined}
      >
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>

          {/* Icon */}
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: config.color + "18",
                borderColor: config.color + "40",
              },
            ]}
          >
            <Ionicons name={config.icon} size={36} color={config.color} />
          </View>

          <Text style={styles.title}>{title}</Text>

          {description ? (
            <Text style={styles.description}>{description}</Text>
          ) : null}

          {/* Buttons */}
          <View
            style={[
              styles.buttonsRow,
              resolvedButtons.length === 1 && styles.buttonsSingle,
            ]}
          >
            {resolvedButtons.map((btn, index) => {
              const isPrimary   = btn.variant === "primary" || !btn.variant;
              const isSecondary = btn.variant === "secondary";
              const isDanger    = btn.variant === "danger";

              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  onPress={() => {
                    btn.onPress?.();
                    if (!isSecondary) onClose();
                  }}
                  style={[
                    styles.button,
                    resolvedButtons.length === 1 && styles.buttonFull,
                    isPrimary   && styles.buttonPrimary,
                    isSecondary && styles.buttonSecondary,
                    isDanger    && styles.buttonDanger,
                  ]}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      isPrimary   && styles.buttonTextPrimary,
                      isSecondary && styles.buttonTextSecondary,
                      isDanger    && styles.buttonTextDanger,
                    ]}
                  >
                    {btn.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

        </Pressable>
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
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    title: {
      fontSize: theme.fontSize.title,
      fontWeight: "700",
      color: theme.colors.text,
      textAlign: "center",
    },
    description: {
      fontSize: theme.fontSize.text,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
    buttonsRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 12,
      width: "100%",
    },
    buttonsSingle: {
      justifyContent: "center",
    },
    button: {
      flex: 1,
      height: 54,
      borderRadius: 16,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonFull: {
      flex: 1,
    },

    // Primary — igual ao Button.tsx
    buttonPrimary: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    buttonTextPrimary: {
      color: theme.colors.primaryForeground,
      fontSize: theme.fontSize.text,
      fontWeight: "600",
    },

    // Secondary — sutil, só borda
    buttonSecondary: {
      backgroundColor: "transparent",
      borderColor: theme.colors.border,
    },
    buttonTextSecondary: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSize.text,
      fontWeight: "600",
    },

    // Danger — vermelho do tema
    buttonDanger: {
      backgroundColor: theme.colors.destructive + "18",
      borderColor: theme.colors.destructive + "50",
    },
    buttonTextDanger: {
      color: theme.colors.destructive,
      fontSize: theme.fontSize.text,
      fontWeight: "600",
    },

    buttonText: {
      fontSize: theme.fontSize.text,
      fontWeight: "600",
    },
  });

export default AppModal;

export type ModalConfig = {
  visible: boolean;
  variant: ModalVariant;
  title: string;
  description?: string;
  buttons?: ModalButton[];
};

export const MODAL_HIDDEN: ModalConfig = {
  visible: false,
  variant: "info",
  title: "",
};