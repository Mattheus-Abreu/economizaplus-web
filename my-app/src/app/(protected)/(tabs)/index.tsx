import { GRADIENTS } from "@/components/CardHome";
import GoalCard from "@/components/GoalCard";
import Logo from "@/components/Logo";
import AppModal, { MODAL_HIDDEN, ModalConfig } from "@/components/modal/modal";
import QuickActions from "@/components/QuickActions";
import Screen from "@/components/Screen";
import { Shimmer, ShimmerGroup } from "@/components/shimmer/Shimmer";
import { useCategory } from "@/contexts/categoryContext";
import { useGoals } from "@/contexts/goalContext";
import { useAIPlan } from "@/hooks/useAIPlan";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useBalance } from "@/hooks/useBalance";
import Goal from "@/types/goal";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Link, Stack, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import { BlurCarousel } from "../../../components/carousel";
import Icons from "../../../components/Icons";

const QUICK_ACTIONS_HEIGHT = 90;
const SURFACE_PADDING = 24;
const GOAL_CARD_WIDTH = Dimensions.get("window").width - SURFACE_PADDING - 40;

function Home() {
  const { goals } = useGoals();
  const { categories } = useCategory();
  const { formattedBalance } = useBalance();
  const router = useRouter();
  const [modal, setModal] = useState<ModalConfig>(MODAL_HIDDEN);
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { status: aiStatus, refetch } = useAIPlan();

  const [fontLoaded] = useFonts({
    InterRegular: require("@/assets/fonts/Inter-Regular.otf"),
    InterMedium: require("@/assets/fonts/Inter-Medium.otf"),
    InterBold: require("@/assets/fonts/Inter-Bold.otf"),
  });

  const filteredCategories = (categories ?? []).filter(
    (category) => category.type === "default"
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  useEffect(() => {
    if (goals !== undefined && categories !== undefined) {
      setIsLoading(false);
      return;
    }
    const timeout = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timeout);
  }, [goals, categories]);

  function handleAIPress() {
    if (aiStatus === "has_plan") {
      router.push("/educationalPage/IAScreen");
    } else {
      router.push("/educationalPage/finEducation");
    }
  }

  const aiLoading = aiStatus === "idle" || aiStatus === "loading";
  const hasPlan = aiStatus === "has_plan";

  return (
    <Screen style={{ padding: 0 }}>
      <GestureHandlerRootView>
        <StatusBar style="light" />

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ShimmerGroup
            isLoading={isLoading}
            preset="dark"
            duration={1000}
            direction="leftToRight"
          >
            {/* ── Header ── */}
            <View style={styles.header}>
              <Logo size="md" />

              {/* Botão IA próximo à logo */}
              <TouchableOpacity
                onPress={handleAIPress}
                disabled={aiLoading}
                activeOpacity={0.75}
                style={styles.aiBtn}
              >
                <Ionicons
                  name="sparkles-outline"
                  size={16}
                  color="#7C3AED"
                />
                <Text style={styles.aiBtnText}>
                  {hasPlan ? "Meu plano" : "Criar plano"}
                </Text>
                {/* Ponto indicador: vermelho se sem plano, verde se tem */}
                {!aiLoading && (
                  <View
                    style={[
                      styles.aiDot,
                      { backgroundColor: hasPlan ? "#22C55E" : "#E05C7A" },
                    ]}
                  />
                )}
              </TouchableOpacity>
            </View>

            {/* ── Saldo ── */}
            <View style={styles.balanceArea}>
              <Text style={styles.balanceLabel}>Saldo atual</Text>

              {isLoading ? (
                <Shimmer style={styles.balanceSkeleton} />
              ) : (
                <TouchableOpacity
                  onPress={() => router.push("/transaction/transactionPage")}
                >
                  <Text
                    style={[
                      styles.balanceValue,
                      fontLoaded && { fontFamily: "InterBold" },
                    ]}
                  >
                    {formattedBalance ?? "R$ 0,00"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.surface}>
              <View style={styles.quickActionsWrapper}>
                <QuickActions />
              </View>

              {/* ── Categorias ── */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Categorias</Text>
                <Link href={"/category/categoryPage"} style={styles.sectionLink}>
                  Ver mais
                </Link>
              </View>

              <View style={styles.categoriesGrid}>
                <TouchableOpacity
                  onPress={() => router.push("/category/createCategory")}
                >
                  <Icons name="plus" color="#f171f1" onlyIcon />
                </TouchableOpacity>

                {isLoading
                  ? Array.from({ length: 7 }).map((_, index) => (
                      <Shimmer key={index} style={styles.categorySkeleton} />
                    ))
                  : filteredCategories.map((item) => (
                      <TouchableOpacity
                        key={item.name}
                        onPress={() =>
                          router.push({
                            pathname: "/category/categoryDetail",
                            params: { id: item.id },
                          })
                        }
                      >
                        <Icons
                          name={item.icon}
                          label={item.name}
                          color={item.color}
                        />
                      </TouchableOpacity>
                    ))}
              </View>

              {/* ── Metas ── */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Metas</Text>
                <Link href={"/(protected)/goal/goalPage"} style={styles.sectionLink}>
                  Ver mais
                </Link>
              </View>

              {isLoading ? (
                <Shimmer style={styles.goalsSkeleton} />
              ) : goals?.length === 0 ? (
                <Text style={styles.emptyText}>Nenhuma meta criada ainda</Text>
              ) : (
                <View style={{ marginHorizontal: -SURFACE_PADDING }}>
                  <BlurCarousel
                    data={goals ?? []}
                    itemWidth={GOAL_CARD_WIDTH}
                    horizontalSpacing={SURFACE_PADDING}
                    renderItem={({ item, index }: { item: Goal; index: number }) => (
                      <GoalCard
                        item={item}
                        gradient={GRADIENTS[index % GRADIENTS.length]}
                        gradientIndex={index}
                      />
                    )}
                  />
                </View>
              )}
            </View>
          </ShimmerGroup>
        </ScrollView>
      </GestureHandlerRootView>

      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>

      <AppModal
        visible={modal.visible}
        onClose={() => setModal(MODAL_HIDDEN)}
        variant={modal.variant}
        title={modal.title}
        description={modal.description}
        buttons={modal.buttons}
      />
    </Screen>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    header: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    // ── Botão IA ──
    aiBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: "rgba(124,58,237,0.12)",
      borderWidth: 1,
      borderColor: "rgba(124,58,237,0.25)",
    },
    aiBtnText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#7C3AED",
    },
    aiDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },

    balanceSkeleton: {
      width: 250,
      height: 48,
      borderRadius: 12,
    },
    goalsSkeleton: {
      width: "100%",
      height: 180,
      borderRadius: 16,
    },
    categorySkeleton: {
      width: 80,
      height: 80,
      borderRadius: 12,
    },
    balanceArea: {
      alignItems: "center",
      paddingTop: 40,
      paddingBottom: QUICK_ACTIONS_HEIGHT / 2 + 5,
    },
    balanceLabel: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginBottom: 6,
    },
    balanceValue: {
      fontSize: 40,
      fontWeight: "700",
      textAlign: "center",
      color: theme.colors.text,
      letterSpacing: -1,
    },
    surface: {
      backgroundColor: theme.colors.surface,
      borderTopStartRadius: 36,
      borderTopEndRadius: 36,
      paddingTop: QUICK_ACTIONS_HEIGHT / 2 + 5,
      padding: 24,
      paddingBottom: 120,
      gap: 20,
      minHeight: Dimensions.get("window").height * 0.75,
    },
    quickActionsWrapper: {
      position: "absolute",
      top: -(QUICK_ACTIONS_HEIGHT / 2.5),
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      zIndex: 10,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    sectionTitle: {
      fontSize: theme.fontSize.title,
      fontWeight: "700",
      color: theme.colors.text,
    },
    sectionLink: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.primary,
    },
    categoriesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 5,
    },
    emptyText: {
      color: theme.colors.textSecondary,
      paddingVertical: 50,
      textAlign: "center",
    },
  });

export default Home;