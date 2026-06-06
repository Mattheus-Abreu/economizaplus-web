import { useTheme } from "@/components/theme-switch/hooks";
import { StyleSheet, Text, View } from "react-native";

export type StatItem = {
  label: string;
  value: string;
  valueColor?: string;
};

type AdminStatListProps = {
  title?: string;
  items: StatItem[];
};

export function AdminStatList({ title, items }: AdminStatListProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      {title && <Text style={styles.title}>{title}</Text>}
      {items.map((item, i) => (
        <View
          key={i}
          style={[styles.row, i < items.length - 1 && styles.rowBorder]}
        >
          <Text style={styles.label}>{item.label}</Text>
          <Text style={[styles.value, item.valueColor ? { color: item.valueColor } : null]}>
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 16,
      borderWidth: 0.5,
      borderColor: colors.glass,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 10,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
    },
    rowBorder: {
      borderBottomWidth: 0.5,
      borderBottomColor: "rgba(255,255,255,0.05)",
    },
    label: {
      fontSize: 13,
      color: colors.textSecondary,
      flex: 1,
    },
    value: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text,
    },
  });