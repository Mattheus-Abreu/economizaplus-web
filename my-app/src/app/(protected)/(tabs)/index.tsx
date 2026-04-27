import theme from "@/app/themes/theme";
import CardHome from "@/components/CardHome";
import Logo from "@/components/Logo";
import QuickActions from "@/components/QuickActions";
import Screen from "@/components/Screen";
import { useGoals } from "@/contexts/goalContext";
import useAuth from "@/hooks/useAuth";
import Goal from "@/types/goal";
import { FontAwesome } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
    GestureHandlerRootView,
    ScrollView,
} from "react-native-gesture-handler";
import { BlurCarousel } from "../../../components/carousel";
import Icons from "../../../components/Icons";
import { useBalance } from "@/hooks/useBalance";
import { useEffect, useState } from "react";
import { MODAL_HIDDEN, ModalConfig } from "@/components/modal/modal";
import AppModal from "@/components/modal/modal";
import { useCategory } from "@/contexts/categoryContext";
import { ShimmerGroup, Shimmer } from "@/components/shimmer/Shimmer";

const QUICK_ACTIONS_HEIGHT = 90;

function Home() {
  const { signOut } = useAuth();
  const { goals } = useGoals();
  const { categories } = useCategory();
  const { formattedBalance } = useBalance();
  const router = useRouter();
  const [modal, setModal] = useState<ModalConfig>(MODAL_HIDDEN);

  const [fontLoaded] = useFonts({
    InterRegular: require("@/assets/fonts/Inter-Regular.otf"),
    InterMedium: require("@/assets/fonts/Inter-Medium.otf"),
    InterBold: require("@/assets/fonts/Inter-Bold.otf"),
  });

  const filteredCategories = (categories ?? []).filter(
    (category) => category.type === "default"
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (goals !== undefined && categories !== undefined) {
      setIsLoading(false);
      return;
    }

    const timeout = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timeout);
  }, [goals, categories]);

  function handleLogout() {
    setModal({
      visible: true,
      variant: "warning",
      title: "Sair",
      description: "Tem certeza que deseja sair da sua conta?",
      buttons: [
        {
          label: "Cancelar",
          onPress: () => setModal(MODAL_HIDDEN),
          variant: "secondary",
        },
        {
          label: "Sair",
          onPress: () => {
            signOut();
            setModal(MODAL_HIDDEN);
          },
          variant: "danger",
        },
      ],
    })
  }

  return (
    <Screen style={{ padding: 0 }}>
      <GestureHandlerRootView>
        <StatusBar style="light" />

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          <ShimmerGroup
            isLoading={isLoading}
            preset="dark"
            duration={1000}
            direction="leftToRight"
            >
          <View style={styles.header}>
            <Logo size="md" />

            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <FontAwesome
                name="sign-out"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.balanceArea}>
            <Text style={styles.balanceLabel}>Saldo atual</Text>

            {isLoading ? (
              <Shimmer style={styles.balanceSkeleton} />
            ) : (
              <Text
                style={[
                  styles.balanceValue,
                  fontLoaded && { fontFamily: "InterBold" },
                ]}
              >
                {formattedBalance ?? "R$ 0,00"}
              </Text>
            )}

          </View>

          <View style={styles.surface}>
            <View style={styles.quickActionsWrapper}>
              <QuickActions />
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Categorias</Text>
              <Link
                href={"/category/categoryPage"}
                style={styles.sectionLink}
              >
                Ver mais
              </Link>
            </View>

            <View style={styles.categoriesGrid}>
              <TouchableOpacity
                  onPress={() => router.push("/category/createCategory" )}
                >
                  <Icons
                    name="plus"
                    color="#f171f1"
                    onlyIcon
                  />
                </TouchableOpacity>
                {isLoading 
                ? Array.from({ length: 7 }).map((_, index) => (
                  <Shimmer key={index} style={styles.categorySkeleton} />
                ))
                : filteredCategories.map((item) => (
                  <TouchableOpacity
                    key={item.name}
                    onPress={() => router.push({ pathname: "/category/categoryDetail", params: { id: item.id } })}
                  >
                    <Icons
                      name={item.icon}
                      label={item.name}
                      color={item.color}
                    />
                  </TouchableOpacity>
                ))}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Metas</Text>
              <Link
                href={"/(protected)/goal/goalPage"}
                style={styles.sectionLink}
              >
                Ver mais
              </Link>
            </View>

            
              {isLoading ? (
                <Shimmer style={styles.goalsSkeleton} />
              ) : goals?.length === 0 ? (
                <Text style={styles.emptyText}>
                  Nenhuma meta criada ainda
                </Text>
              ) : (
                <BlurCarousel
                  data={goals ?? []}
                  renderItem={({ item, index }: { item: Goal; index: number }) => (
                    <CardHome
                      item={item}
                      fontLoaded={fontLoaded}
                      gradientIndex={index}
                    />
                  )}
                />
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

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
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
    flex: 1,
    borderTopStartRadius: 36,
    borderTopEndRadius: 36,
    paddingTop: QUICK_ACTIONS_HEIGHT / 2 + 5,
    padding: 24,
    gap: 20,
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
