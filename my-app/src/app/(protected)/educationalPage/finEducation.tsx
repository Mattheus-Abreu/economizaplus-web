import Button from "@/components/Button";
import Checkbox from "@/components/inputs/Checkbox";
import { Pagination } from "@/components/pagination/Pagination";
import Screen from "@/components/Screen";
import { useAppTheme } from "@/hooks/useAppTheme";
import useAuth from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const DURATION = 350;
const EASING = Easing.bezier(0.4, 0, 0.2, 1);
const SLIDE_OFFSET = 40;

type Page = {
  id: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  isForm?: boolean;
};

const PAGES: Page[] = [
  {
    id: "1",
    icon: "wallet-outline",
    iconColor: "#7C3AED",
    iconBg: "rgba(124,58,237,0.12)",
    title: "Bem-vindo ao\nEconomiza+",
    subtitle:
      "Controle suas finanças de forma inteligente. Registre transações, acompanhe metas e entenda para onde vai o seu dinheiro — tudo em um só lugar.",
  },
  {
    id: "2",
    icon: "sparkles-outline",
    iconColor: "#38BDF8",
    iconBg: "rgba(56,189,248,0.12)",
    title: "IA que entende\nseus objetivos",
    subtitle:
      "A IA analisa seus planos financeiros e gera dicas personalizadas para te ajudar a alcançar cada meta com mais segurança e eficiência.",
  },
  {
    id: "3",
    icon: "flag-outline",
    iconColor: "#22C55E",
    iconBg: "rgba(34,197,94,0.12)",
    title: "Você tem planos\npara o futuro?",
    subtitle:
      "Selecione seus objetivos e a IA vai preparar um guia personalizado para te ajudar a realizá-los.",
    isForm: true,
  },
];

function finEducation() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [goal, setGoal] = useState<string[]>([]);
  const router = useRouter();
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { clearFirstLogin } = useAuth();

  // Marca o onboarding como visto imediatamente ao chegar aqui.
  // Assim "Pular" e o botão "Gerar dicas" funcionam sem redirecionar novamente.
  useEffect(() => {
    clearFirstLogin();
  }, []);

  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  function animateTo(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= PAGES.length) return;
    const direction = nextIndex > currentIndex ? 1 : -1;
    setCurrentIndex(nextIndex);
    opacity.value = withTiming(0, { duration: DURATION / 2, easing: EASING });
    translateX.value = withTiming(
      -SLIDE_OFFSET * direction,
      { duration: DURATION / 2, easing: EASING },
      (finished) => {
        if (!finished) return;
        runOnJS(setDisplayIndex)(nextIndex);
        translateX.value = SLIDE_OFFSET * direction;
        opacity.value = withTiming(1, { duration: DURATION / 2, easing: EASING });
        translateX.value = withTiming(0, { duration: DURATION / 2, easing: EASING });
      }
    );
  }

  function handleSubmit() {
    if (goal.length === 0) {
      Alert.alert("Atenção", "Selecione pelo menos um plano para continuar!");
      return;
    }
    // Passa goals nos params → IAScreen detecta e faz POST
    router.replace({
      pathname: "/educationalPage/IAScreen",
      params: { goals: JSON.stringify(goal) },
    });
  }

  const page = PAGES[displayIndex];
  const isLastPage = currentIndex === PAGES.length - 1;
  const isFirstPage = currentIndex === 0;

  return (
    <Screen style={styles.screen}>
      <View style={styles.skipRow}>
        {!isLastPage ? (
          <Link href="/(protected)/(tabs)" style={styles.skip}>
            Pular
          </Link>
        ) : (
          <View />
        )}
      </View>

      <Animated.View style={[styles.pageContainer, animatedStyle]}>
        <View style={[styles.iconWrap, { backgroundColor: page.iconBg }]}>
          <Ionicons name={page.icon as any} size={48} color={page.iconColor} />
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.title}>{page.title}</Text>
          <Text style={styles.subtitle}>{page.subtitle}</Text>
        </View>

        {page.isForm && (
          <View style={styles.checkboxContainer}>
            <Checkbox
              options={[
                { label: "Viagem dos sonhos", value: "Viagem dos sonhos" },
                { label: "Aposentadoria", value: "Aposentadoria" },
                { label: "Casa própria", value: "Casa própria" },
                { label: "Filhos", value: "Filhos" },
                { label: "Carro", value: "Carro" },
                { label: "Moto", value: "Moto" },
                { label: "Casamento", value: "Casamento" },
                { label: "Outro", value: "Outro" },
              ]}
              checkedValues={goal}
              onChange={setGoal}
            />
          </View>
        )}
      </Animated.View>

      <View style={styles.paginationRow}>
        <Pagination
          activeIndex={currentIndex}
          totalItems={PAGES.length}
          onIndexChange={animateTo}
          dotSize={10}
          dotContainer={20}
          inactiveColor="rgba(255,255,255,0.15)"
          activeColor="rgba(255,255,255,0.15)"
          currentColor="#7C3AED"
          borderRadius={100}
          containerStyle={{ backgroundColor: "transparent" }}
        />
      </View>

      <View style={styles.buttonsRow}>
        {!isFirstPage && (
          <TouchableOpacity
            onPress={() => animateTo(currentIndex - 1)}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}

        <View style={[styles.nextBtnWrap, isFirstPage && styles.nextBtnFull]}>
          <Button
            label={isLastPage ? "Gerar dicas" : "Próximo"}
            onPress={
              isLastPage ? handleSubmit : () => animateTo(currentIndex + 1)
            }
          />
        </View>
      </View>

      {isLastPage && (
        <Link
          href="/(protected)/(tabs)"
          style={styles.skipBottom}
        >
          Pular por agora
        </Link>
      )}
    </Screen>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    screen: { padding: 0 },
    skipRow: {
      paddingHorizontal: 24,
      paddingTop: 60,
      alignItems: "flex-end",
      minHeight: 52,
    },
    skip: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.textSecondary,
    },
    pageContainer: {
      flex: 1,
      paddingHorizontal: 32,
      paddingTop: 40,
      paddingBottom: 16,
      alignItems: "center",
      gap: 24,
    },
    iconWrap: {
      width: 100,
      height: 100,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    textBlock: { gap: 12, alignItems: "center" },
    title: {
      fontSize: theme.fontSize.title,
      fontWeight: "700",
      color: theme.colors.text,
      textAlign: "center",
      lineHeight: 36,
    },
    subtitle: {
      fontSize: theme.fontSize.subtitle,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
    },
    checkboxContainer: { width: "100%", maxHeight: 280 },
    paginationRow: { alignItems: "center", paddingVertical: 20 },
    buttonsRow: {
      flexDirection: "row",
      paddingHorizontal: 24,
      paddingBottom: 16,
      gap: 12,
      alignItems: "center",
    },
    backBtn: {
      width: 54,
      height: 54,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.1)",
      backgroundColor: "rgba(255,255,255,0.04)",
      alignItems: "center",
      justifyContent: "center",
    },
    nextBtnWrap: { flex: 1 },
    nextBtnFull: { flex: 1 },
    skipBottom: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginTop: 12,
      marginBottom: 32,
      alignSelf: "center",
    },
  });

export default finEducation;