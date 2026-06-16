import Screen from "@/components/Screen";
import { useTheme } from "@/components/theme-switch/hooks";
import useAuth from "@/hooks/useAuth";
import { api } from "@/api/api";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const BENEFITS = [
  { icon: "sparkles-outline" as const,     label: "IA financeira ilimitada" },
  { icon: "bar-chart-outline" as const,    label: "Relatórios avançados" },
  { icon: "wallet-outline" as const,       label: "Carteiras sem limite" },
  { icon: "headset-outline" as const,      label: "Suporte prioritário" },
];

function formatCardNumber(raw: string) {
  return raw.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

export default function CheckoutScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { updateUserPlan } = useAuth();
  const styles = createStyles(colors);

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const successScale = useRef(new Animated.Value(0.6)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  async function handleSubscribe() {
    setLoading(true);
    try {
      await api.patch("/api/users/plan", { plan: "PREMIUM" });
      await updateUserPlan("PREMIUM");

      Animated.parallel([
        Animated.spring(successScale, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 160 }),
        Animated.timing(successOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      setSuccess(true);
    } catch {
      // em produção exibiria um erro; aqui mantemos silencioso por ser mock
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = cardName.trim().length > 0 && cardNumber.replace(/\s/g, "").length === 16 && expiry.length === 5 && cvv.length >= 3;

  return (
    <Screen style={{ padding: 0 }}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>

          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Assinar Premium</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* ── Hero card ── */}
          <LinearGradient
            colors={["#7C3AED", "#A855F7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroBadge}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.heroBadgeText}>PREMIUM</Text>
            </View>
            <Text style={styles.heroPrice}>R$ 9,90</Text>
            <Text style={styles.heroPeriod}>por mês</Text>

            <View style={styles.divider} />

            {BENEFITS.map((b, i) => (
              <View key={i} style={styles.benefitRow}>
                <View style={styles.benefitIconWrap}>
                  <Ionicons name={b.icon} size={16} color="#fff" />
                </View>
                <Text style={styles.benefitLabel}>{b.label}</Text>
              </View>
            ))}
          </LinearGradient>

          {/* ── Payment form ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados de pagamento</Text>
            <Text style={styles.sectionHint}>Ambiente de demonstração — nenhuma cobrança será realizada.</Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Nome no cartão</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Gustavo Sousa"
                placeholderTextColor={colors.textSecondary}
                value={cardName}
                onChangeText={setCardName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Número do cartão</Text>
              <View style={styles.inputRow}>
                <Ionicons name="card-outline" size={18} color={colors.textSecondary} style={{ marginLeft: 14 }} />
                <TextInput
                  style={[styles.input, { flex: 1, borderWidth: 0 }]}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor={colors.textSecondary}
                  value={cardNumber}
                  onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>
            </View>

            <View style={styles.fieldRow}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Validade</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/AA"
                  placeholderTextColor={colors.textSecondary}
                  value={expiry}
                  onChangeText={(t) => setExpiry(formatExpiry(t))}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  placeholderTextColor={colors.textSecondary}
                  value={cvv}
                  onChangeText={(t) => setCvv(t.replace(/\D/g, "").slice(0, 4))}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>
          </View>

          {/* ── CTA ── */}
          <TouchableOpacity
            style={[styles.cta, (!canSubmit || loading) && styles.ctaDisabled]}
            onPress={handleSubscribe}
            disabled={!canSubmit || loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={canSubmit && !loading ? ["#7C3AED", "#A855F7"] : ["#3D3D4E", "#3D3D4E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              {loading ? (
                <Text style={styles.ctaText}>Processando...</Text>
              ) : (
                <>
                  <Ionicons name="star" size={18} color="#FFD700" />
                  <Text style={styles.ctaText}>Assinar Agora</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Cancele quando quiser. Sem fidelidade.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Success overlay ── */}
      {success && (
        <View style={styles.successOverlay}>
          <Animated.View style={[styles.successCard, { transform: [{ scale: successScale }], opacity: successOpacity }]}>
            <LinearGradient
              colors={["#7C3AED", "#A855F7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.successIconWrap}
            >
              <Ionicons name="star" size={40} color="#FFD700" />
            </LinearGradient>
            <Text style={styles.successTitle}>Você é Premium!</Text>
            <Text style={styles.successDesc}>
              Seu plano foi atualizado com sucesso. Aproveite todos os benefícios.
            </Text>
            <TouchableOpacity style={styles.successBtn} onPress={() => router.back()} activeOpacity={0.85}>
              <LinearGradient
                colors={["#7C3AED", "#A855F7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.successBtnGradient}
              >
                <Text style={styles.successBtnText}>Voltar ao perfil</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </Screen>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 60,
      paddingBottom: 16,
    },
    backBtn: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.08)",
      borderWidth: 0.5, borderColor: "rgba(255,255,255,0.12)",
      alignItems: "center", justifyContent: "center",
    },
    headerTitle: { fontSize: 20, fontWeight: "700", color: colors.text },

    heroCard: {
      marginHorizontal: 16,
      borderRadius: 24,
      padding: 24,
      gap: 10,
    },
    heroBadge: {
      flexDirection: "row", alignItems: "center", gap: 6,
      alignSelf: "flex-start",
      backgroundColor: "rgba(0,0,0,0.25)",
      paddingHorizontal: 10, paddingVertical: 4,
      borderRadius: 20,
    },
    heroBadgeText: { fontSize: 11, fontWeight: "800", color: "#FFD700", letterSpacing: 1 },
    heroPrice: { fontSize: 48, fontWeight: "900", color: "#fff", marginTop: 8 },
    heroPeriod: { fontSize: 16, color: "rgba(255,255,255,0.75)", marginTop: -8 },
    divider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginVertical: 8 },
    benefitRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    benefitIconWrap: {
      width: 28, height: 28, borderRadius: 8,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center", justifyContent: "center",
    },
    benefitLabel: { fontSize: 15, color: "#fff", fontWeight: "500" },

    section: { marginHorizontal: 16, marginTop: 24, gap: 16 },
    sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
    sectionHint: { fontSize: 12, color: colors.textSecondary, marginTop: -8 },

    field: { gap: 6 },
    fieldLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: "500" },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      paddingHorizontal: 14,
      paddingVertical: 13,
      fontSize: 16,
      color: colors.text,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    fieldRow: { flexDirection: "row", gap: 12 },

    cta: { marginHorizontal: 16, marginTop: 28, borderRadius: 18, overflow: "hidden" },
    ctaDisabled: { opacity: 0.55 },
    ctaGradient: {
      flexDirection: "row", alignItems: "center", justifyContent: "center",
      gap: 8, paddingVertical: 16,
    },
    ctaText: { fontSize: 17, fontWeight: "700", color: "#fff" },

    disclaimer: {
      textAlign: "center", fontSize: 12,
      color: colors.textSecondary, marginTop: 12,
    },

    successOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.75)",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    successCard: {
      backgroundColor: colors.surface,
      borderRadius: 28,
      padding: 32,
      alignItems: "center",
      gap: 16,
      width: "100%",
    },
    successIconWrap: {
      width: 80, height: 80, borderRadius: 40,
      alignItems: "center", justifyContent: "center",
    },
    successTitle: { fontSize: 26, fontWeight: "900", color: colors.text, textAlign: "center" },
    successDesc: {
      fontSize: 14, color: colors.textSecondary,
      textAlign: "center", lineHeight: 20,
    },
    successBtn: { width: "100%", borderRadius: 14, overflow: "hidden", marginTop: 4 },
    successBtnGradient: {
      paddingVertical: 14,
      alignItems: "center",
    },
    successBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  });
