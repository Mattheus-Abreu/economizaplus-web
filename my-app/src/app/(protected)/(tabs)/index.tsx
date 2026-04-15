import theme from "@/app/themes/theme";
import Logo from "@/components/Logo";
import QuickActions from "@/components/QuickActions";
import Screen from "@/components/Screen";
import { useGoals } from "@/contexts/goalContext";
import useAuth from "@/hooks/useAuth";
import Goal from "@/types/goal";
import { FontAwesome } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Link, Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import { BlurCarousel } from "../../../components/carousel";
import Icons from "../../../components/Icons";
import { useBalance } from "@/hooks/useBalance";
import CardHome from "@/components/CardHome";

const QUICK_ACTIONS_HEIGHT = 90;

function Home() {
  const { signOut } = useAuth();
  const { goals } = useGoals();
  const { formattedBalance } = useBalance();
  const router = useRouter();

  const [fontLoaded] = useFonts({
    InterRegular: require("@/assets/fonts/Inter-Regular.otf"),
    InterMedium: require("@/assets/fonts/Inter-Medium.otf"),
    InterBold: require("@/assets/fonts/Inter-Bold.otf"),
  });

  function handleLogout() {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", onPress: signOut },
    ]);
  }

  const CATEGORIES = [
    { name: "plus", label: "Add", color: "#f171f1", route: "/(protected)/category/createCategory" },
    { name: "lightbulb-o", label: "Luz", color: "#FACC15", route: "/(protected)/category/categoryPage" },
    { name: "tint", label: "Água", color: "#38BDF8", route: "/(protected)/category/categoryPage" },
    { name: "wifi", label: "Internet", color: "#A78BFA", route: "/(protected)/category/categoryPage" },
    { name: "shopping-cart", label: "Compras", color: "#34D399", route: "/(protected)/category/categoryPage" },
    { name: "car", label: "Transporte", color: "#FB7185", route: "/(protected)/category/categoryPage" },
    { name: "cutlery", label: "Comida", color: "#F97316", route: "/(protected)/category/categoryPage" },
    { name: "heartbeat", label: "Saúde", color: "#EF4444", route: "/(protected)/category/categoryPage" },
  ];

  return (
    <Screen style={{ padding: 0 }}>
      <GestureHandlerRootView>
        <StatusBar style="light" />

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
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

            <Text
              style={[
                styles.balanceValue,
                fontLoaded && { fontFamily: "InterBold" },
              ]}
            >
              {formattedBalance ?? "R$ 0,00"}
            </Text>
          </View>

          <View style={styles.surface}>

            <View style={styles.quickActionsWrapper}>
              <QuickActions />
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Categorias</Text>
              <Link
                href={"/(protected)/category/categoryPage"}
                style={styles.sectionLink}
              >
                Ver mais
              </Link>
            </View>

            <View style={styles.categoriesGrid}>
              {CATEGORIES.map((item) => (
                <TouchableOpacity
                  key={item.name}
                  onPress={() => router.push(item.route as any)}
                >
                  <Icons
                    name={item.name as any}
                    label={item.label}
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

            {goals?.length === 0 ? (
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
        </ScrollView>
      </GestureHandlerRootView>

      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
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