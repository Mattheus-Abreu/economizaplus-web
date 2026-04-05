import theme from "@/app/themes/theme";
import CardMeta from "@/components/CardHome";
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

type Props = {
  item: Goal;
};

function Home({ item }: Props) {
  const { signOut } = useAuth();
  const router = useRouter();
  const { goals } = useGoals();

  function handleLogout() {
    Alert.alert("Sair", "tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", onPress: signOut },
    ]);
  }
  const [fontLoaded] = useFonts({
    InterRegular: require("@/assets/fonts/Inter-Regular.otf"),
    InterMedium: require("@/assets/fonts/Inter-Medium.otf"),
    InterBold: require("@/assets/fonts/Inter-Bold.otf"),
  });

  const CATEGORIES = [
    { name: "plus", label: "Add", color: "#f171f1" },
    { name: "lightbulb-o", label: "Luz", color: "#FACC15" },
    { name: "tint", label: "Água", color: "#38BDF8" },
    { name: "wifi", label: "Internet", color: "#A78BFA" },
    { name: "shopping-cart", label: "Compras", color: "#34D399" },
    { name: "car", label: "Transporte", color: "#FB7185" },
    { name: "cutlery", label: "Comida", color: "#F97316" },
    { name: "heartbeat", label: "Saúde", color: "#EF4444" },
  ];

  return (
    <Screen style={{ padding: "auto" }}>
      <GestureHandlerRootView>
        <StatusBar style="light" />
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.header}>
            <Text
              style={[styles.title, fontLoaded && { fontFamily: "InterBold" }]}
            >
              Logo
            </Text>
            <TouchableOpacity onPress={handleLogout}>
              <FontAwesome
                name="sign-out"
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
          >
            <Text
              style={{
                color: theme.colors.textSecondary,
                fontSize: 18,
                fontWeight: 400,
              }}
            >
              Saldo atual
            </Text>
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 44,
                fontWeight: "bold",
              }}
            >
              $ 1.000
            </Text>
          </View>

          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderTopStartRadius: 40,
              borderTopEndRadius: 40,
              paddingBottom: 60,
            }}
          >
            <View
              style={{
                padding: 20,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: theme.fontSize.title,
                  fontWeight: "bold",
                }}
              >
                Categorias
              </Text>
              <Link
                href={"/(protected)/category/categoryPage"}
                style={{
                  color: theme.colors.text,
                  fontSize: 12,
                  fontWeight: 600,
                  marginTop: 8,
                }}
              >
                Ver mais
              </Link>
            </View>
            <View
              style={{
                padding: 20,
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              {CATEGORIES.map((item, index) => (
                <Icons
                  key={index}
                  name={item.name as any}
                  label={item.label}
                  color={item.color}
                />
              ))}
            </View>
            <View
              style={{
                padding: 20,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: theme.fontSize.title,
                  fontWeight: "bold",
                }}
              >
                Metas
              </Text>
              <Link
                href={"/(protected)/goal/goalPage"}
                style={{
                  color: theme.colors.text,
                  fontSize: 12,
                  fontWeight: 600,
                  marginTop: 8,
                }}
              >
                Ver mais
              </Link>
            </View>
            {goals.length === 0 ? (
              <Text style={{ color: theme.colors.textSecondary, padding: 20 }}>
                Nenhuma meta criada ainda
              </Text>
            ) : (
              <BlurCarousel
                data={goals}
                renderItem={({
                  item,
                  index,
                }: {
                  item: Goal;
                  index: number;
                }) => (
                  <CardMeta
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
    paddingTop: 70,
    paddingBottom: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 42,
    fontWeight: "700",
    color: theme.colors.text,
  },
});

export default Home;
