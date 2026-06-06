import { useTheme } from "@/components/theme-switch/hooks";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type AdminUser = {
  id: string;
  name: string;
  plan: string;
  transactionCount: number;
  totalAmount: number;
  avatarColor?: string;
};

type AdminUserRowProps = {
  user: AdminUser;
  onPress?: (user: AdminUser) => void;
  formatCurrency?: (value: number) => string;
  isLast?: boolean;
};

const AVATAR_COLORS = [
  ["#7C3AED", "#A855F7"],
  ["#059669", "#22C55E"],
  ["#D97706", "#F59E0B"],
  ["#DB2777", "#F472B6"],
  ["#1D4ED8", "#60A5FA"],
  ["#DC2626", "#F87171"],
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function defaultFormatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function AdminUserRow({
  user,
  onPress,
  formatCurrency = defaultFormatCurrency,
  isLast = false,
}: AdminUserRowProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Cor do avatar: usa avatarColor ou deriva do id
  const colorPair =
    AVATAR_COLORS[
      user.id
        .split("")
        .reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length
    ];

  const planColor =
    user.plan === "Pro"
      ? "#A855F7"
      : user.plan === "Premium"
      ? "#22C55E"
      : "rgba(255,255,255,0.35)";

  return (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.rowBorder]}
      onPress={() => onPress?.(user)}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      {/* Avatar */}
      <View
        style={[
          styles.avatar,
          { backgroundColor: user.avatarColor ?? colorPair[0] },
        ]}
      >
        <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {user.name}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.plan, { color: planColor }]}>{user.plan}</Text>
          <Text style={styles.separator}>·</Text>
          <Text style={styles.txCount}>
            {user.transactionCount} transações
          </Text>
        </View>
      </View>

      {/* Valor */}
      <Text style={styles.amount}>{formatCurrency(user.totalAmount)}</Text>
    </TouchableOpacity>
  );
}

// ── Lista completa com título ─────────────────────────────────────────────────
type AdminUserListProps = {
  users: AdminUser[];
  title?: string;
  onUserPress?: (user: AdminUser) => void;
  formatCurrency?: (value: number) => string;
};

export function AdminUserList({
  users,
  title,
  onUserPress,
  formatCurrency,
}: AdminUserListProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      {title && <Text style={styles.cardTitle}>{title}</Text>}
      {users.map((user, i) => (
        <AdminUserRow
          key={user.id}
          user={user}
          onPress={onUserPress}
          formatCurrency={formatCurrency}
          isLast={i === users.length - 1}
        />
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
    cardTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 12,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 10,
    },
    rowBorder: {
      borderBottomWidth: 0.5,
      borderBottomColor: "rgba(255,255,255,0.05)",
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    avatarText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#fff",
    },
    info: {
      flex: 1,
      gap: 2,
    },
    name: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    plan: {
      fontSize: 11,
      fontWeight: "600",
    },
    separator: {
      fontSize: 11,
      color: "rgba(255,255,255,0.2)",
    },
    txCount: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    amount: {
      fontSize: 13,
      fontWeight: "700",
      color: "#A855F7",
    },
  });