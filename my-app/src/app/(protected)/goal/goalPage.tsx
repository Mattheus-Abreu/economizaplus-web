import theme from "@/app/themes/theme";
import Arrow from "@/assets/images/Arrow.svg";
import { GRADIENTS } from "@/components/CardHome";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/empty-state";
import FloatingButton from "@/components/FloatingButton";
import GoalCard from "@/components/GoalCard";
import Screen from "@/components/Screen";
import { Shimmer, ShimmerGroup } from "@/components/shimmer/Shimmer";
import { useGoals } from "@/contexts/goalContext";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

function goalPage() {
  const router = useRouter();
  const { goals } = useGoals();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (goals !== undefined) {
      setIsLoading(false);
      return;
    }
    const timeout = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timeout);
  }, [goals]);

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
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => router.back()}
                >
                  <FontAwesome
                    name="arrow-left"
                    size={16}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.hero}>
                <Text style={styles.heroLabel}>Minhas Metas</Text>
                <Text style={styles.heroTitle}>
                  Toque em uma meta e veja seu progresso
                </Text>
                <Text style={styles.heroSub}>Ou crie novas metas</Text>
              </View>

              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Shimmer key={index} style={styles.goalSkeleton} />
                ))
              ) : (goals ?? []).length === 0 ? (
                <SafeAreaView style={styles.container}>
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia
                        variant="icon"
                        style={{ backgroundColor: theme.colors.surface }}
                      >
                        {Platform.OS === "ios" ? (
                          <SymbolView
                            name="target"
                            size={60}
                            tintColor="#fff"
                          />
                        ) : (
                          <Ionicons
                            name="trending-up-outline"
                            size={60}
                            color="#fff"
                          />
                        )}
                      </EmptyMedia>
                      <EmptyTitle>Nenhuma meta</EmptyTitle>
                      <View
                        style={{
                          position: "absolute",
                          bottom: -320,
                          left: 0,
                          gap: 15,
                          alignItems: "center",
                        }}
                      >
                        <EmptyDescription>
                          Que tal começar criando uma meta
                        </EmptyDescription>
                        <Arrow
                          width={100}
                          height={60}
                          style={{ transform: [{ rotate: "20deg" }] }}
                        />
                      </View>
                    </EmptyHeader>
                  </Empty>
                </SafeAreaView>
              ) : (
                (goals ?? []).map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() =>
                      router.push({
                        pathname: "/goal/goalDetail",
                        params: { id: item.id, gradientIndex: index },
                      })
                    }
                  >
                    <GoalCard
                      item={item}
                      gradient={GRADIENTS[index % GRADIENTS.length]}
                    />
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        </ShimmerGroup>
      </ScrollView>
      <FloatingButton
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          padding: 25,
        }}
        onPress={() => router.push("/goal/createGoal")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 56,
  },
  header: {
    paddingTop: 56,
    paddingBottom: 4,
  },
  hero: {
    paddingTop: 5,
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
  goalSkeleton: {
    width: "100%",
    height: 120,
    borderRadius: 20,
    marginBottom: 16,
  },
});

export default goalPage;
