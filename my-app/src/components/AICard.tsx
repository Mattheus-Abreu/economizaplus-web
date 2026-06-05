import { useAIPlan } from "@/hooks/useAIPlan";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

/**
 * Card exibido na Home que navega para:
 *  - finEducation  → se o usuário não tem plano
 *  - IAScreen      → se já tem plano salvo
 *
 * Uso na Home:
 *   <AICard />
 */
export function AICard() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { status } = useAIPlan();

  function handlePress() {
    if (status === "loading" || status === "idle") return;

    if (status === "has_plan") {
      // Já tem plano → exibe direto, sem gerar novo
      router.push("/educationalPage/IAScreen");
    } else {
      // Sem plano ou erro → vai para o onboarding de criação
      router.push("/educationalPage/finEducation");
    }
  }

  const isLoading = status === "idle" || status === "loading";
  const hasPlan = status === "has_plan";

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      disabled={isLoading}
      style={styles.wrapper}
    >
      <LinearGradient
        colors={["rgba(124,58,237,0.22)", "rgba(124,58,237,0.06)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Left: icon */}
        <View style={styles.iconWrap}>
          <Ionicons name="sparkles-outline" size={26} color="#7C3AED" />
        </View>

        {/* Center: text */}
        <View style={styles.textWrap}>
          <Text style={styles.title}>
            {hasPlan ? "Meu planejamento IA" : "Criar planejamento IA"}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {hasPlan
              ? "Ver dicas personalizadas para seus objetivos"
              : "Deixe a IA montar um guia para suas metas financeiras"}
          </Text>
        </View>

        {/* Right: arrow or spinner */}
        <View style={styles.rightSlot}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#7C3AED" />
          ) : (
            <View style={styles.arrowWrap}>
              <Ionicons
                name={hasPlan ? "arrow-forward" : "add-circle-outline"}
                size={20}
                color="#7C3AED"
              />
            </View>
          )}
        </View>

        {/* Badge "Novo" se não tiver plano */}
        {!isLoading && !hasPlan && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>IA</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    wrapper: {
      width: "100%",
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: "rgba(124,58,237,0.22)",
      overflow: "hidden",
    },
    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: "rgba(124,58,237,0.15)",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    textWrap: {
      flex: 1,
      gap: 3,
    },
    title: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 17,
    },
    rightSlot: {
      width: 32,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    arrowWrap: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: "rgba(124,58,237,0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    badge: {
      position: "absolute",
      top: 10,
      right: 10,
      backgroundColor: "#7C3AED",
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: "700",
      color: "#fff",
      letterSpacing: 0.5,
    },
  });