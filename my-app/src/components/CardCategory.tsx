import { useTransactions } from "@/contexts/transactionContext"
import { useAppTheme } from "@/hooks/useAppTheme"
import Category from "@/types/category"
import { FontAwesome } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"


type Props = {
    item: Category;
}

function CardCategory({ item }: Props) {
    const { transactions } = useTransactions();
    const router = useRouter();
    const count = (transactions ?? []).filter((t) => t.categoryId === item.id).length;
    const theme = useAppTheme();
    const styles = createStyles(theme);
  return (
    <TouchableOpacity key={item.id} style={styles.card} onPress={() => router.push({ pathname: "/category/categoryDetail", params: { id: item.id }})}>
                  
        <View style={[styles.iconContainer, { backgroundColor: item.color + "30" }]}>
        <FontAwesome
            name={item.icon}
            size={24}
            color={item.color}
        />
        </View>

        <Text style={styles.title}>{item.name}</Text>

        <Text style={styles.subtitle}>
        {count} {count === 1 ? "transação" : "transações"}
        </Text>
        
    </TouchableOpacity>
  )
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
 StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 16,

    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.glass,
  },

  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  title: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
  },

  subtitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
})

export default CardCategory