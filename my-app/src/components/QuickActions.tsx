import theme from "@/app/themes/theme";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Action = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
  type?: "INCOME" | "EXPENSE";
};

const ACTIONS: Action[] = [
  {
    label: "Entrada",
    icon: "arrow-down-circle-outline",
    color: "#22C55E",
    route: "/(protected)/transaction/transactionsPage",
    type: "INCOME",
  },
  {
    label: "Saída",
    icon: "arrow-up-circle-outline",
    color: "#FB7185",
    route: "/(protected)/transaction/transactionsPage",
    type: "EXPENSE",
  },
  {
    label: "Carteiras",
    icon: "wallet-outline",
    color: "#38BDF8",
    route: "/(protected)/wallet/walletPage",
  },
];

function QuickActions() {
  const router = useRouter();

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
          <View style={[styles.iconWrap]}>
            <Ionicons name={action.icon} size={22} color={action.color} />
          </View>
          <Text style={styles.label}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.glass,
    marginHorizontal: 30,

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
    borderRadius: 12,
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