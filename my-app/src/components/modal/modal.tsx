import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";

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
  dismissible?: boolean; // 👈 novo
};

const VARIANTS: Record<
  ModalVariant,
  { icon: IconName; color: string; background: string; border: string }
> = {
  success: {
    icon: "checkmark-circle",
    color: "#22C55E",
    background: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.25)",
  },
  error: {
    icon: "close-circle",
    color: "#EF4444",
    background: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.25)",
  },
  warning: {
    icon: "warning",
    color: "#F97316",
    background: "rgba(249,115,22,0.1)",
    border: "rgba(249,115,22,0.25)",
  },
  info: {
    icon: "information-circle",
    color: "#38BDF8",
    background: "rgba(56,189,248,0.1)",
    border: "rgba(56,189,248,0.25)",
  },
  confirm: {
    icon: "help-circle",
    color: "#7C3AED",
    background: "rgba(124,58,237,0.1)",
    border: "rgba(124,58,237,0.25)",
  },
};

const BUTTON_STYLES: Record<
  NonNullable<ModalButton["variant"]>,
  { background: string; text: string; border: string }
> = {
  primary: {
    background: "#7C3AED",
    text: "#ffffff",
    border: "#7C3AED",
  },
  secondary: {
    background: "transparent",
    text: "#94A3B8",
    border: "rgba(255,255,255,0.1)",
  },
  danger: {
    background: "rgba(239,68,68,0.12)",
    text: "#EF4444",
    border: "rgba(239,68,68,0.3)",
  },
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
  const config = VARIANTS[variant];

  // 👇 botão padrão inteligente
  const resolvedButtons: ModalButton[] =
    buttons && buttons.length > 0
      ? buttons
      : variant === "confirm"
      ? [
          { label: "Cancelar", variant: "secondary", onPress: onClose },
          { label: "Confirmar", variant: "primary", onPress: onClose },
        ]
      : [{ label: "OK", onPress: onClose, variant: "primary" }];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Overlay */}
      <Pressable
        style={styles.overlay}
        onPress={dismissible ? onClose : undefined}
      >
        {/* Card */}
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {/* Ícone */}
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: config.background,
                borderColor: config.border,
              },
            ]}
          >
            <Ionicons name={config.icon} size={36} color={config.color} />
          </View>

          {/* Título */}
          <Text style={styles.title}>{title}</Text>

          {/* Descrição */}
          {description ? (
            <Text style={styles.description}>{description}</Text>
          ) : null}

          {/* Botões */}
          <View
            style={[
              styles.buttonsRow,
              resolvedButtons.length === 1 && styles.buttonsSingle,
            ]}
          >
            {resolvedButtons.map((btn, index) => {
              const btnStyle = BUTTON_STYLES[btn.variant ?? "primary"];

              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  onPress={() => {
                    btn.onPress?.();

                    // 👇 fecha automaticamente exceto se quiser comportamento custom
                    if (btn.variant !== "secondary") {
                      onClose();
                    }
                  }}
                  style={[
                    styles.button,
                    resolvedButtons.length === 1 && styles.buttonFull,
                    {
                      backgroundColor: btnStyle.background,
                      borderColor: btnStyle.border,
                    },
                  ]}
                >
                  <Text style={[styles.buttonText, { color: btnStyle.text }]}>
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

const styles = StyleSheet.create({
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
    backgroundColor: "#1A1333",
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
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
    fontSize: 18,
    fontWeight: "700",
    color: "#F8FAFC",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#94A3B8",
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
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonFull: {
    flex: 1,
  },
  buttonText: {
    fontSize: 15,
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