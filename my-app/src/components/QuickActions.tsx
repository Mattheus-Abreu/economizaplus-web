import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Action = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  style?: object;
};

const ACTIONS: Action[] = [
  {
    label: "Entrada",
    icon: "arrow-up",
    color: "#22C55E",
    style: { transform: [{ rotate: "40deg" }] },
    route: "/(protected)/transaction/transactionsPage",
    type: "INCOME",
  },
  {
    label: "Saída",
    icon: "arrow-down",
    color: "#FB7185",
    style: { transform: [{ rotate: "40deg" }] },
    route: "/(protected)/transaction/transactionsPage",
    type: "EXPENSE",
  },
  {
    label: "Transferência",
    icon: "swap-vertical-outline",
    color: "#FF9800",
    route: "/(protected)/transaction/transactionsPage",
    type: "TRANSFER",
  },
];

function QuickActions() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {ACTIONS.map((action, index) => (
        <Pressable
          key={action.label}
          style={({ pressed }) => [
            styles.action,
            pressed && styles.actionPressed,
          ]}
          onPress={() => router.push({ pathname: action.route as any, params: { type: action.type } })}
        >
          <View style={[styles.iconWrap, action.style]}>
            <Ionicons name={action.icon} size={24} color={action.color}  />
          </View>
          <Text style={styles.label}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => 
StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.glass,
    marginHorizontal: 30,

    shadowColor: theme.colors.mutedForeground,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  action: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 6,
  },
  actionBorder: {
    borderRightWidth: 0.5,
    borderRightColor: "rgba(255,255,255,0.08)",
  },
  actionPressed: {
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  iconWrap: {
    width: 25,
    height: 25,
    // borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    color: theme.colors.textSecondary,
  },
});

export default QuickActions;