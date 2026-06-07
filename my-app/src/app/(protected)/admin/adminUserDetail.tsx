import AppModal, { MODAL_HIDDEN, ModalConfig } from "@/components/modal/modal";
import Screen from "@/components/Screen";
import { useTheme } from "@/components/theme-switch/hooks";
import { AdminUpdateUserPayload, AdminUserDetail, useAdminUsers } from "@/hooks/useAdminUsers";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";


const PLAN_OPTIONS = ["BASIC", "PREMIUM", "INACTIVE"];
const ROLE_OPTIONS: Array<"COMMON" | "ADMIN"> = ["COMMON", "ADMIN"];

const PLAN_LABEL: Record<string, string> = {
  BASIC:    "Básico",
  PREMIUM:  "Premium",
  INACTIVE: "Inativo",
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

const AVATAR_COLORS = ["#7C3AED", "#059669", "#D97706", "#DB2777", "#1D4ED8", "#DC2626"];
function avatarColor(id: string) {
  return AVATAR_COLORS[id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
}

export default function AdminUserDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { getById, update, remove } = useAdminUsers();

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modal, setModal] = useState<ModalConfig>(MODAL_HIDDEN);

  const [plan, setPlan] = useState("");
  const [role, setRole] = useState<"COMMON" | "ADMIN">("COMMON");

  const AUTH_PROVIDER_LABEL: Record<string, string> = {
    LOCAL:  "Email",
    GOOGLE: "Google",
  };

  const PLAN_COLOR: Record<string, string> = {
    BASIC:    colors.textSecondary,
    PREMIUM:  colors.success,
    INACTIVE: colors.destructive,
  };

  useEffect(() => {
    if (!id) return;
    getById(id)
      .then((u) => {
        setUser(u);
        setPlan(u.plan);
        setRole(u.role);
      })
      .catch(() => setModal({ visible: true, variant: "error", title: "Erro", description: "Não foi possível carregar o usuário." }))
      .finally(() => setIsLoading(false));
  }, [id]);

  const isDirty = user && (plan !== user.plan || role !== user.role);

  const ROLE_LABEL: Record<"COMMON" | "ADMIN", string> = {
    COMMON: "Comum",
    ADMIN: "Administrador",
    };

  async function handleSave() {
    if (!user || !isDirty) return;
    setIsSaving(true);
    try {
      const payload: AdminUpdateUserPayload = {};
      if (plan !== user.plan) payload.plan = plan;
      if (role !== user.role) payload.role = role;
      const updated = await update(user.id, payload);
      setUser(updated);
      setModal({ visible: true, variant: "success", title: "Salvo", description: "Usuário atualizado com sucesso." });
    } catch (err: any) {
      setModal({ visible: true, variant: "error", title: "Erro", description: err?.response?.data?.message ?? "Não foi possível salvar." });
    } finally {
      setIsSaving(false);
    }
  }

  function handleDelete() {
    if (!user) return;
    setModal({
      visible: true,
      variant: "warning",
      title: "Excluir usuário",
      description: `Tem certeza que deseja excluir ${user.name}? Esta ação é irreversível.`,
      buttons: [
        { label: "Cancelar", variant: "secondary", onPress: () => setModal(MODAL_HIDDEN) },
        {
          label: "Excluir",
          variant: "danger",
          onPress: async () => {
            setModal(MODAL_HIDDEN);
            await remove(user.id);
            router.back();
          },
        },
      ],
    });
  }

  if (isLoading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </Screen>
    );
  }

  if (!user) return null;

  const color = avatarColor(user.id);

  return (
    <Screen style={{ padding: 0 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes do usuário</Text>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={colors.destructive} />
          </TouchableOpacity>
        </View>

        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: color }]}>
            <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.userMeta}>
            Desde {formatDate(user.createdAt)} · {AUTH_PROVIDER_LABEL[user.authProvider] ?? user.authProvider}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user.transactionCount}</Text>
            <Text style={styles.statLabel}>Transações</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxMiddle]}>
            <Text style={[styles.statValue, { color: "#A855F7" }]}>{formatBRL(user.totalAmount)}</Text>
            <Text style={styles.statLabel}>Volume total</Text>
          </View>
          <View style={styles.statBox}>
            <Text
                style={[
                    styles.statValue,
                    { color: user.role === "ADMIN" ? "#F59E0B" : colors.textSecondary }
                ]}
                >
                {ROLE_LABEL[user.role]}
            </Text>
            <Text style={styles.statLabel}>Perfil atual</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Plano</Text>
          <View style={styles.optionsRow}>
            {PLAN_OPTIONS.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.optionBtn, plan === p && { backgroundColor: PLAN_COLOR[p] + "22", borderColor: PLAN_COLOR[p] }]}
                onPress={() => setPlan(p)}
              >
                <Text style={[styles.optionText, plan === p && { color: PLAN_COLOR[p], fontWeight: "700" }]}>
                  {PLAN_LABEL[p]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Perfil de acesso</Text>
          <View style={styles.optionsRow}>
            {ROLE_OPTIONS.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.optionBtn, role === r && styles.optionBtnActive]}
                onPress={() => setRole(r)}
              >
                <Text style={[styles.optionText, role === r && styles.optionTextActive]}>
                  {r === "ADMIN" ? "Administrador" : "Comum"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {isDirty && (
          <View style={styles.saveRow}>
            <TouchableOpacity
              style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.saveBtnText}>Salvar alterações</Text>
              }
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

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

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    centered: { flex: 1, alignItems: "center", justifyContent: "center" },
    header: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12,
    },
    headerTitle: { fontSize: 17, fontWeight: "600", color: colors.text },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.glass + "5",
      borderWidth: 0.5,
      borderColor: colors.glass,
      alignItems: "center",
      justifyContent: "center",
    },
    deleteBtn: {
      width: 40, height: 40, borderRadius: 12,
      backgroundColor: colors.destructive + "15",
      alignItems: "center", justifyContent: "center",
    },
    avatarSection: { alignItems: "center", paddingVertical: 24, gap: 6 },
    avatar: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
    avatarText: { fontSize: 28, fontWeight: "700", color: "#fff" },
    userName: { fontSize: 22, fontWeight: "700", color: colors.text, marginTop: 4 },
    userEmail: { fontSize: 14, color: colors.textSecondary },
    userMeta: { fontSize: 12, color: colors.textSecondary },
    statsRow: {
      flexDirection: "row", marginHorizontal: 16, marginBottom: 20,
      backgroundColor: colors.surface, borderRadius: 18,
      borderWidth: 0.5, borderColor: colors.glass,
    },
    statBox: { flex: 1, alignItems: "center", paddingVertical: 16, gap: 4 },
    statBoxMiddle: { borderLeftWidth: 0.5, borderRightWidth: 0.5, borderColor: colors.glass },
    statValue: { fontSize: 15, fontWeight: "700", color: colors.text },
    statLabel: { fontSize: 11, color: colors.textSecondary },
    section: { marginHorizontal: 16, marginBottom: 20, gap: 10 },
    sectionLabel: {
      fontSize: 11, fontWeight: "600", color: colors.textSecondary,
      textTransform: "uppercase", letterSpacing: 0.8,
    },
    optionsRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
    optionBtn: {
      paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12,
      borderWidth: 1, borderColor: colors.glass,
      backgroundColor: colors.surface,
    },
    optionBtnActive: { backgroundColor: colors.primary + "20", borderColor: colors.primary },
    optionText: { fontSize: 13, color: colors.textSecondary, fontWeight: "500" },
    optionTextActive: { color: colors.primary, fontWeight: "700" },
    saveRow: { marginHorizontal: 16, marginTop: 8 },
    saveBtn: {
      backgroundColor: colors.primary, borderRadius: 16,
      paddingVertical: 15, alignItems: "center",
    },
    saveBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
  });