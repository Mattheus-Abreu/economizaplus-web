import { useAppTheme } from "@/hooks/useAppTheme";
import Category from "@/types/category";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  item: Category;
  totalAmount?: number;
  txCount?: number;
  totalExpense?: number;
  rank?: number;
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const RANK_BADGE = ["🥇", "🥈", "🥉"];

function CardCategory({ item, totalAmount = 0, txCount = 0, totalExpense = 0, rank }: Props) {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const pct = totalExpense > 0 ? (totalAmount / totalExpense) * 100 : 0;
  const hasSpend = totalAmount > 0;
  const showRank = rank !== undefined && rank <= 3 && hasSpend;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: "/category/categoryDetail", params: { id: item.id } })}
      activeOpacity={0.75}
    >
      <View style={[styles.colorBar, { backgroundColor: item.color }]} />

      <View style={[styles.iconWrap, { backgroundColor: item.color + "20" }]}>
        <FontAwesome name={item.icon as any} size={20} color={item.color} />
      </View>

      <View style={styles.middle}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          {showRank && <Text style={styles.medal}>{RANK_BADGE[rank! - 1]}</Text>}
        </View>

        <Text style={styles.meta}>
          {txCount} {txCount === 1 ? "transação" : "transações"}
        </Text>

        {hasSpend && (
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { width: `${Math.min(pct, 100)}%` as any, backgroundColor: item.color },
              ]}
            />
          </View>
        )}
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, hasSpend ? { color: item.color } : { color: theme.colors.textSecondary }]}>
          {hasSpend ? formatBRL(totalAmount) : "—"}
        </Text>
        {hasSpend && (
          <Text style={styles.pct}>{pct.toFixed(0)}%</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: 18,
      borderWidth: 0.5,
      borderColor: "rgba(255,255,255,0.07)",
      overflow: "hidden",
      padding: 14,
      gap: 12,
    },

    colorBar: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      borderTopLeftRadius: 18,
      borderBottomLeftRadius: 18,
    },

    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 8,
    },

    middle: {
      flex: 1,
      gap: 3,
    },

    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    name: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.text,
      flexShrink: 1,
    },

    medal: {
      fontSize: 15,
    },

    meta: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },

    barTrack: {
      height: 3,
      backgroundColor: "rgba(255,255,255,0.08)",
      borderRadius: 2,
      overflow: "hidden",
      marginTop: 4,
    },

    barFill: {
      height: 3,
      borderRadius: 2,
    },

    right: {
      alignItems: "flex-end",
      gap: 2,
    },

    amount: {
      fontSize: 15,
      fontWeight: "700",
    },

    pct: {
      fontSize: 11,
      color: theme.colors.textSecondary,
    },
  });

export default CardCategory;
