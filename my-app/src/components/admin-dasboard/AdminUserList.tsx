import { useTheme } from "@/components/theme-switch/hooks";
import { LinearGradient } from "expo-linear-gradient";
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

// ── Paleta de avatares ────────────────────────────────────────────────────────
const AVATAR_GRADIENTS: [string, string][] = [
  ["#7C3AED", "#A855F7"],
  ["#059669", "#34D399"],
  ["#D97706", "#FBBF24"],
  ["#DB2777", "#F472B6"],
  ["#1D4ED8", "#60A5FA"],
  ["#DC2626", "#F87171"],
];

type PlanConfig = {
  color: string;
  bg: string;
  label: string;
};

function getPlanConfigMap(
  colors: ReturnType<typeof useTheme>["colors"]
): Record<string, PlanConfig> {
  return {
    Premium: {
      color: colors.success,
      bg: "rgba(34,197,94,0.12)",
      label: "Premium",
    },
    Básico: {
      color: colors.textSecondary,
      bg: colors.textSecondary + "1A",
      label: "Básico",
    },
    Inativo: {
      color: colors.destructive,
      bg: "rgba(244,63,94,0.12)",
      label: "Inativo",
    },
    BASIC: {
      color: colors.textSecondary,
      bg: colors.textSecondary + "1A",
      label: "Básico",
    },
    PREMIUM: {
      color: colors.success,
      bg: "rgba(34,197,94,0.12)",
      label: "Premium",
    },
    LOCAL: {
      color: colors.textSecondary,
      bg: colors.textSecondary + "1A",
      label: "Básico",
    },
    INACTIVE: {
      color: colors.destructive,
      bg: "rgba(244,63,94,0.12)",
      label: "Inativo",
    },
  };
}

function getPlanConfig(
  plan: string,
  colors: ReturnType<typeof useTheme>["colors"]
) {
  const PLAN_CONFIG = getPlanConfigMap(colors);

  return (
    PLAN_CONFIG[plan] ?? {
      color: "rgba(255,255,255,0.4)",
      bg: "rgba(255,255,255,0.06)",
      label: plan,
    }
  );
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function avatarGradient(id: string): [string, string] {
  return AVATAR_GRADIENTS[
    id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_GRADIENTS.length
  ];
}

function defaultFormatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ── Row ───────────────────────────────────────────────────────────────────────

export function AdminUserRow({
  user,
  onPress,
  formatCurrency = defaultFormatCurrency,
  isLast = false,
}: AdminUserRowProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const gradColors = avatarGradient(user.id);
  const plan = getPlanConfig(user.plan, colors);

  return (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.rowBorder]}
      onPress={() => onPress?.(user)}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      {/* Avatar com gradiente */}
      <LinearGradient
        colors={gradColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.avatar}
      >
        <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
      </LinearGradient>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{user.name}</Text>
        <View style={styles.metaRow}>
          <View style={[styles.planBadge, { backgroundColor: plan.bg }]}>
            <Text style={[styles.planText, { color: plan.color }]} numberOfLines={1}>
              {plan.label}
            </Text>
          </View>
          <Text style={styles.separator}>·</Text>
          <Text style={styles.txCount} numberOfLines={1}>
            {user.transactionCount} {user.transactionCount === 1 ? "transação" : "transações"}
          </Text>
        </View>
        
      </View>

      {/* Valor + seta */}
      <View style={styles.right}>
        <Text style={styles.amount}>{formatCurrency(user.totalAmount)}</Text>
        {onPress && (
          <Text style={styles.chevron}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ── Lista ─────────────────────────────────────────────────────────────────────

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

  if (users.length === 0) return null;

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

// ── Styles ────────────────────────────────────────────────────────────────────

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      paddingVertical: 4,
      paddingHorizontal: 16,
      borderWidth: 0.5,
      borderColor: colors.glass,
      gap: 10
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 8,
      marginTop: 12,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 12,
      minHeight: 60,
    },
    rowBorder: {
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    avatarText: {
      fontSize: 14,
      fontWeight: "800",
      color: "#fff",
      letterSpacing: 0.5,
    },
    info: {
      flex: 1,
      flexDirection: "column",
      justifyContent: "center",
      gap: 4,
      minWidth: 0,
    },
    name: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text,
      lineHeight: 17,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      flexWrap: "nowrap",
      overflow: "hidden",
    },
    planBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      flexShrink: 0,       
    },
    planText: {
      fontSize: 10,
      fontWeight: "700",
    },
    separator: {
      fontSize: 10,
      color: "rgba(255,255,255,0.15)",
      flexShrink: 0,
    },
    txCount: {
      fontSize: 11,
      color: colors.textSecondary,
      flexShrink: 1,         
    },
    right: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 8,
    },
    amount: {
      fontSize: 13,
      fontWeight: "700",
      color: "#A855F7",
    },
    chevron: {
      fontSize: 18,
      color: colors.textSecondary,
      lineHeight: 20,
    },
  });