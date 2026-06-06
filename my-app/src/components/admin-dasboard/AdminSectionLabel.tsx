import { useTheme } from "@/components/theme-switch/hooks";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type AdminSectionLabelProps = {
  label: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function AdminSectionLabel({
  label,
  actionLabel,
  onAction,
}: AdminSectionLabelProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      marginTop: 20,
      marginBottom: 10,
    },
    label: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.textSecondary + "90",
      letterSpacing: 1.2,
    },
    action: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.primary,
    },
  });