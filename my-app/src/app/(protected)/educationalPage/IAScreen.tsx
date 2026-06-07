import { api } from "@/api/api";
import Button from "@/components/Button";
import Screen from "@/components/Screen";
import { useAppTheme } from "@/hooks/useAppTheme";
import useAuth from "@/hooks/useAuth";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

type Tip = {
  title: string;
  description: string;
};

type Section = {
  title: string;
  tips: Tip[];
};

type AIResponse = {
  sections: Section[];
  finalTip: string;
};

type Status = "loading" | "success" | "error";

const SECTION_ACCENT_COLORS = [
  "#7C3AED",
  "#2A9D6E",
  "#5DA8D4",
  "#E05C7A",
  "#FCA370",
];

function IAScreen() {
  const router = useRouter();
  const { goals } = useLocalSearchParams();
  const { token } = useAuth();
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const [content, setContent] = useState<AIResponse | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const parsedGoals: string[] = useMemo(
    () => (goals ? JSON.parse(goals as string) : []),
    [goals]
  );

  // Dot animation for loading
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status !== "loading") return;
    const pulse = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(800 - delay),
        ])
      );
    const a1 = pulse(dot1, 0);
    const a2 = pulse(dot2, 200);
    const a3 = pulse(dot3, 400);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, [status]);

  // Fade-in for content
  const contentOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (status === "success") {
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [status]);

  useEffect(() => {
    if (!token) return;
    async function load() {
      setStatus("loading");
      try {
        let raw: string;
        if (parsedGoals.length > 0) {
          const result = await api.post(
            "/api/ai/tips",
            { goals: parsedGoals },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          raw = result.data.tips;
        } else {
          const result = await api.get("/api/ai/tips", {
            headers: { Authorization: `Bearer ${token}` },
          });
          raw = result.data.tips;
        }
        const data: AIResponse = typeof raw === "string" ? JSON.parse(raw) : raw;
        setContent(data);
        setStatus("success");
      } catch (error: any) {
        const msg =
          error?.response?.data?.message ||
          "Não foi possível carregar o planejamento. Tente novamente.";
        setErrorMessage(msg);
        setStatus("error");
      }
    }
    load();
  }, [token]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <Screen style={styles.centeredScreen}>
        <View style={styles.loadingCard}>
          <LinearGradient
            colors={["rgba(124,58,237,0.18)", "rgba(124,58,237,0.04)"]}
            style={styles.loadingIconWrap}
          >
            <Ionicons name="sparkles-outline" size={36} color="#7C3AED" />
          </LinearGradient>
          <Text style={styles.loadingTitle}>Gerando seu planejamento</Text>
          <Text style={styles.loadingSubtitle}>
            A IA está analisando seus objetivos
          </Text>
          <View style={styles.dotsRow}>
            {[dot1, dot2, dot3].map((dot, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    opacity: dot,
                    transform: [
                      {
                        scale: dot.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.7, 1.2],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </Screen>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <Screen style={styles.centeredScreen}>
        <View style={styles.errorCard}>
          <View style={styles.errorIconWrap}>
            <Ionicons name="alert-circle-outline" size={44} color="#E05C7A" />
          </View>
          <Text style={styles.errorTitle}>Algo deu errado</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              setStatus("loading");
              setContent(null);
              setErrorMessage("");
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={16} color="#fff" />
            <Text style={styles.retryBtnText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────
  return (
    <Screen style={{ padding: 0 }}>
      <Animated.View style={{ flex: 1, opacity: contentOpacity }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
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
          {/* Header */}
          <View style={styles.pageHeader}>
            <LinearGradient
              colors={["rgba(124,58,237,0.2)", "rgba(124,58,237,0.05)"]}
              style={styles.pageHeaderIconWrap}
            >
              <Ionicons name="sparkles-outline" size={26} color="#7C3AED" />
            </LinearGradient>
            <View style={styles.pageHeaderText}>
              <Text style={styles.pageHeaderTitle}>Planejamento IA</Text>
              <Text style={styles.pageHeaderSubtitle}>
                Dicas personalizadas para seus objetivos
              </Text>
            </View>
          </View>

          {/* Goals pills */}
          {parsedGoals.length > 0 && (
            <View style={styles.goalsWrap}>
              <Text style={styles.goalsLabel}>Seus objetivos</Text>
              <View style={styles.pillsRow}>
                {parsedGoals.map((g) => (
                  <View key={g} style={styles.goalPill}>
                    <Ionicons name="flag-outline" size={11} color="#7C3AED" />
                    <Text style={styles.goalPillText}>{g}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Sections */}
          {content?.sections.map((section, sIdx) => {
            const accent =
              SECTION_ACCENT_COLORS[sIdx % SECTION_ACCENT_COLORS.length];
            return (
              <View key={sIdx} style={styles.sectionCard}>
                {/* Section header with colored left bar */}
                <View style={styles.sectionHeader}>
                  <View
                    style={[styles.sectionAccentBar, { backgroundColor: accent }]}
                  />
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>

                {/* Tips */}
                {section.tips.map((tip, tIdx) => (
                  <View
                    key={tIdx}
                    style={[
                      styles.tipRow,
                      tIdx < section.tips.length - 1 && styles.tipDivider,
                    ]}
                  >
                    <View
                      style={[
                        styles.tipBadge,
                        { backgroundColor: accent + "22" },
                      ]}
                    >
                      <Text style={[styles.tipBadgeText, { color: accent }]}>
                        {tIdx + 1}
                      </Text>
                    </View>
                    <View style={styles.tipContent}>
                      <Text style={styles.tipTitle}>{tip.title}</Text>
                      <Text style={styles.tipDesc}>{tip.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            );
          })}

          {/* Final tip card */}
          {content?.finalTip && (
            <View style={styles.finalCard}>
              <View style={styles.finalCardHeader}>
                <LinearGradient
                  colors={["rgba(252,163,112,0.25)", "rgba(252,163,112,0.08)"]}
                  style={styles.finalIconWrap}
                >
                  <Ionicons name="bulb-outline" size={20} color="#FCA370" />
                </LinearGradient>
                <Text style={styles.finalCardLabel}>Dica final da IA</Text>
              </View>
              <Text style={styles.finalCardText}>{content.finalTip}</Text>
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* CTA */}
          <View style={styles.ctaBlock}>
            <Text style={styles.ctaTitle}>Pronto para começar?</Text>
            <Text style={styles.ctaSubtitle}>
              Adicione uma carteira para criar suas metas e fazer suas movimentações.
            </Text>
            <Button
              label="Criar carteira agora"
              onPress={() => router.replace("/wallet/createWallet")}
            />
            <TouchableOpacity
              onPress={() => router.replace("/")}
              style={styles.skipBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.skipBtnText}>Fazer isso depois</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </Screen>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    centeredScreen: {
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.colors.glass + "10",
      borderWidth: 0.5,
      borderColor: theme.colors.glass,
      alignItems: "center",
      justifyContent: "center",
    },
    // ── Loading ──
    loadingCard: {
      alignItems: "center",
      gap: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      padding: 36,
      width: "100%",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    loadingIconWrap: {
      width: 80,
      height: 80,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      textAlign: "center",
    },
    loadingSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    dotsRow: {
      flexDirection: "row",
      gap: 8,
      marginTop: 8,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#7C3AED",
    },

    // ── Error ──
    errorCard: {
      alignItems: "center",
      gap: 14,
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      padding: 36,
      width: "100%",
      borderWidth: 1,
      borderColor: "rgba(224,92,122,0.2)",
    },
    errorIconWrap: {
      width: 80,
      height: 80,
      borderRadius: 24,
      backgroundColor: "rgba(224,92,122,0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    errorTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
    },
    errorText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
    retryBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "#7C3AED",
      paddingHorizontal: 24,
      paddingVertical: 13,
      borderRadius: 14,
      marginTop: 4,
    },
    retryBtnText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 15,
    },

    // ── Success ──
    scroll: {
      padding: 20,
      paddingTop: 60,
      gap: 14,
      paddingBottom: 48,
    },

    // Page header
    pageHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      marginBottom: 6,
    },
    pageHeaderIconWrap: {
      width: 56,
      height: 56,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    pageHeaderText: { flex: 1, gap: 3 },
    pageHeaderTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.colors.text,
    },
    pageHeaderSubtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },

    // Goals
    goalsWrap: {
      backgroundColor: theme.colors.surface,
      borderRadius: 18,
      padding: 14,
      gap: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    goalsLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: "#7C3AED",
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    pillsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    goalPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: 100,
      backgroundColor: "rgba(124,58,237,0.1)",
      borderWidth: 1,
      borderColor: "rgba(124,58,237,0.22)",
    },
    goalPillText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#7C3AED",
    },

    // Section card
    sectionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 16,
      gap: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    sectionAccentBar: {
      width: 4,
      height: 20,
      borderRadius: 2,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
      flex: 1,
    },

    // Tip row
    tipRow: {
      flexDirection: "row",
      gap: 12,
      paddingVertical: 4,
    },
    tipDivider: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingBottom: 14,
    },
    tipBadge: {
      width: 26,
      height: 26,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1,
      flexShrink: 0,
    },
    tipBadgeText: {
      fontSize: 12,
      fontWeight: "700",
    },
    tipContent: { flex: 1, gap: 4 },
    tipTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.text,
    },
    tipDesc: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      lineHeight: 19,
    },

    // Final tip
    finalCard: {
      backgroundColor: "rgba(252,163,112,0.08)",
      borderRadius: 20,
      padding: 16,
      gap: 12,
      borderWidth: 1,
      borderColor: "rgba(252,163,112,0.2)",
    },
    finalCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    finalIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    finalCardLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: "#FCA370",
      letterSpacing: 0.4,
    },
    finalCardText: {
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 21,
      fontStyle: "italic",
    },

    // Divider
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 4,
    },

    // CTA
    ctaBlock: {
      gap: 12,
      alignItems: "center",
    },
    ctaTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.colors.text,
      textAlign: "center",
    },
    ctaSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 4,
    },
    skipBtn: {
      paddingVertical: 10,
    },
    skipBtnText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
  });

export default IAScreen;