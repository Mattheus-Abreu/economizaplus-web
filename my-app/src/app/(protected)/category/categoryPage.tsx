import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import theme from "@/app/themes/theme";
import Screen from "@/components/Screen";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTransactions } from "@/contexts/transactionContext";
import { ScrollView } from "react-native-gesture-handler";
import { useCategory } from "@/contexts/categoryContext";
import FloatingButton from "@/components/FloatingButton";
import { useEffect, useState } from "react";
import { Shimmer, ShimmerGroup } from "@/components/shimmer/Shimmer";

function walletPage() {
  const router = useRouter();
  const { categories } = useCategory();
  const { transactions } = useTransactions();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (categories !== undefined){
      setIsLoading(false);
      return;
    }
    const timeout = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timeout);
  },[categories]);
  
  return (
    <Screen style={{ padding: 20 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <ShimmerGroup
          isLoading={isLoading}
          preset="dark"
          duration={1000}
          direction="leftToRight"
          >
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, gap: 20 }}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <FontAwesome
                  name="arrow-left"
                  size={16}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.hero}>
            <Text style={styles.heroLabel}>
              Minhas Categorias
            </Text>
            <Text style={styles.heroTitle}>
              Toque em uma categoria para ver suas transações
            </Text>
            <Text style={styles.heroSub}>
              Ou crie novas categorias
            </Text>
          </View>

          <View style={styles.grid}>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Shimmer style={styles.categorySkeleton}/>
              ))
            ) : (
            (categories ?? []).map((item) => {
              const count = (transactions ?? []).filter(
                (t) => String(t.categoryId) === item.id
              ).length;

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
              );
            })
          )}
            
          </View>

          
        </View>
        </ShimmerGroup>
      </ScrollView>
      <FloatingButton 
        style={{ position: "absolute", bottom: 20, right: 20, padding: 25}}
        onPress={() => router.push("/category/createCategory")}
      />
    </Screen>
  );
}

export default walletPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    alignItems: "center",
  },
  header: {
    paddingTop: 56,
    paddingBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    paddingTop: 24,
    paddingBottom: 28,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.primary,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text,
    lineHeight: 34,
  },
  heroSub: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 8,
    lineHeight: 18,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
  },

  card: {
    width: "47%",
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 16,

    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
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
    color: "#fff",
  },

  subtitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },

  categorySkeleton: {
    width: "47%",   
    height: 130,       
    borderRadius: 20,  
    marginBottom: 16,
  },
});
