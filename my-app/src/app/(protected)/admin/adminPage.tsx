import {
  ActivityEvent,
  AdminActivityFeed,
  AdminBarChart,
  AdminDonutChart,
  AdminSectionLabel,
  AdminStatList,
  AdminUser,
  AdminUserList,
  BarChartDataPoint,
  DonutSlice,
  MetricCard,
} from "@/components/admin-dasboard";
import Logo from "@/components/Logo";
import AppModal, { MODAL_HIDDEN, ModalConfig } from "@/components/modal/modal";
import Screen from "@/components/Screen";
import { useTheme } from "@/components/theme-switch/hooks";
import { useAdminStats } from "@/hooks/useAdminStats";
import useAuth from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { JSX } from "react/jsx-runtime";

// ─────────────────────────────────────────────────────────────────────────────
// Tabs e seus tipos
// ─────────────────────────────────────────────────────────────────────────────
const TABS = ["Geral", "Usuários", "Finanças", "Atividade", "Conta"] as const;
type Tab = (typeof TABS)[number];

function formatBRL(value: number) {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(1).replace(".", ",")}k`;
  }
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [activeTab, setActiveTab] = useState<Tab>("Geral");

  const { data, isLoading, isError, error, refetch } = useAdminStats();

  const [modal, setModal] = useState<ModalConfig>(MODAL_HIDDEN);

  function handleSignOut() {
    setModal({
      visible: true,
      variant: "warning",
      title: "Sair da conta",
      description: "Tem certeza que deseja sair da sua conta?",
      buttons: [
        {
          label: "Cancelar",
          onPress: () => setModal(MODAL_HIDDEN),
          variant: "secondary",
        },
        {
          label: "Sair",
          onPress: async () => {
            await signOut();
            setModal(MODAL_HIDDEN);
          },
          variant: "danger",
        },
      ],
    });
  }

  // ── Transformações para os componentes ───────────────────────────────────

  const barData: BarChartDataPoint[] =
    data?.dailySignups.map((d, i, arr) => ({
      label: d.label,
      value: d.count,
      highlight: i === arr.length - 1,
    })) ?? [];

  const peakDay = [...(data?.dailySignups ?? [])].sort(
    (a, b) => b.count - a.count
  )[0];

  const donutSlices: DonutSlice[] =
    data?.planDistribution.map((p) => ({
      label: p.plan,
      value: p.count,
      color: p.color,
    })) ?? [];

  const topUsers: AdminUser[] =
    data?.topUsers.map((u) => ({
      id: u.id,
      name: u.name,
      plan: u.plan,
      transactionCount: u.transactionCount,
      totalAmount: u.totalAmount,
    })) ?? [];

  const activityEvents: ActivityEvent[] =
    data?.recentActivity.map((e) => ({
      id: e.id,
      type: e.type,
      message: e.message,
      highlight: e.highlight,
      timeLabel: e.timeLabel,
    })) ?? [];

  // ── Render guards ─────────────────────────────────────────────────────────

  if (isLoading && !data) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Carregando métricas…</Text>
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen style={styles.centered}>
        <Ionicons name="warning-outline" size={40} color={colors.destructive} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </Screen>
    );
  }

  const ov = data!.overview;

  // ── Conteúdo por tab ─────────────────────────────────────────────────────

  const renderGeral = () => (
    <>
      {/* Cards com scroll horizontal */}
      <AdminSectionLabel label="Métricas principais" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.metricsScroll}
      >
        <MetricCard
          label="Usuários totais"
          value={ov.totalUsers.toLocaleString("pt-BR")}
          variation={ov.totalUsersVariation}
          sparkColor={colors.primary}
        />
        <MetricCard
          label="Ativos hoje"
          value={ov.activeToday.toLocaleString("pt-BR")}
          variation={ov.activeTodayVariation}
          sparkColor={colors.success}
        />
        <MetricCard
          label="Receita mensal"
          value={formatBRL(ov.monthlyRevenue)}
          variation={ov.monthlyRevenueVariation}
          sparkColor={colors.destructive}
        />
        <MetricCard
          label="Plano Premium"
          value={ov.premiumUsers.toLocaleString("pt-BR")}
          variationLabel={`${ov.premiumUsersPct}% do total`}
          sparkColor="#A855F7"
        />
      </ScrollView>

      {/* Novos usuários */}
      {barData.length > 0 && (
        <>
          <AdminSectionLabel label="Novos usuários — últimos 7 dias" />
          <View style={styles.fullPad}>
            <AdminBarChart
              data={barData}
              color={colors.primary}
              maxBarHeight={64}
              footerLabel={
                peakDay
                  ? `Pico: ${peakDay.label} · ${peakDay.count} cadastros`
                  : undefined
              }
              footerBadge="Semana +18%"
              footerBadgeColor={colors.success}
            />
          </View>
        </>
      )}

      {/* Distribuição de planos */}
      {donutSlices.length > 0 && (
        <>
          <AdminSectionLabel label="Distribuição de planos" />
          <View style={styles.fullPad}>
            <AdminDonutChart
              slices={donutSlices}
              centerLabel={ov.totalUsers.toLocaleString("pt-BR")}
              centerSublabel="usuários"
              size={96}
              strokeWidth={14}
            />
          </View>
        </>
      )}
    </>
  );

  const renderUsuarios = () => (
    <>
      {topUsers.length > 0 && (
        <>
          <AdminSectionLabel
            label="Usuários mais ativos"
            actionLabel="Ver todos"
            onAction={() => router.push("/(protected)/admin/usersList")}
          />
          <View style={styles.fullPad}>
            <AdminUserList
              users={topUsers}
              onUserPress={(user) => router.push({ pathname: "/(protected)/admin/adminUserDetail", params: { id: user.id } })}
              formatCurrency={(v) =>
                v.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              }
            />
          </View>
        </>
      )}
    </>
  );

  const renderFinancas = () => (
    <>
      {/* Cards de finanças com scroll horizontal */}
      <AdminSectionLabel label="Resumo financeiro" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.metricsScroll}
      >
        <MetricCard
          label="Receita mensal"
          value={formatBRL(ov.monthlyRevenue)}
          variation={ov.monthlyRevenueVariation}
          sparkColor={colors.destructive}
        />
        <MetricCard
          label="Plano Premium"
          value={ov.premiumUsers.toLocaleString("pt-BR")}
          variationLabel={`${ov.premiumUsersPct}% do total`}
          sparkColor="#A855F7"
        />
      </ScrollView>

      {donutSlices.length > 0 && (
        <>
          <AdminSectionLabel label="Distribuição de planos" />
          <View style={styles.fullPad}>
            <AdminDonutChart
              slices={donutSlices}
              centerLabel={ov.totalUsers.toLocaleString("pt-BR")}
              centerSublabel="usuários"
              size={96}
              strokeWidth={14}
            />
          </View>
        </>
      )}
    </>
  );

  const renderAtividade = () => (
    <>
      {/* Saúde da plataforma */}
      {(data?.healthMetrics.length ?? 0) > 0 && (
        <>
          <AdminSectionLabel label="Saúde da plataforma" />
          <View style={styles.fullPad}>
            <AdminStatList items={data!.healthMetrics} />
          </View>
        </>
      )}

      {/* Atividade recente */}
      {activityEvents.length > 0 && (
        <>
          <AdminSectionLabel label="Atividade recente" />
          <View style={styles.fullPad}>
            <AdminActivityFeed events={activityEvents} />
          </View>
        </>
      )}
    </>
  );
  const renderConta = () => (
  <>
    {/* Avatar + nome */}
    <View style={styles.contaHero}>
      <View style={styles.contaAvatar}>
        <Text style={styles.contaAvatarText}>
          {user?.name?.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()}
        </Text>
      </View>
      <Text style={styles.contaName}>{user?.name}</Text>
      <View style={styles.contaRoleBadge}>
        <Ionicons name="shield-checkmark" size={12} color={colors.primary} />
        <Text style={styles.contaRoleText}>Administrador</Text>
      </View>
    </View>
 
    {/* Dados da conta */}
    <AdminSectionLabel label="Dados da conta" />
    <View style={[styles.fullPad]}>
      <View style={styles.contaCard}>
        <View style={styles.contaRow}>
          <View style={styles.contaRowLeft}>
            <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.contaRowLabel}>Nome</Text>
          </View>
          <Text style={styles.contaRowValue}>{user?.name}</Text>
        </View>
        <View style={styles.contaRowDivider} />
        <View style={styles.contaRow}>
          <View style={styles.contaRowLeft}>
            <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.contaRowLabel}>Email</Text>
          </View>
          <Text style={styles.contaRowValue} numberOfLines={1}>{user?.email}</Text>
        </View>
        <View style={styles.contaRowDivider} />
        <View style={styles.contaRow}>
          <View style={styles.contaRowLeft}>
            <Ionicons name="shield-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.contaRowLabel}>Perfil</Text>
          </View>
          <View style={styles.contaRoleBadgeInline}>
            <Text style={styles.contaRoleTextInline}>{user?.role}</Text>
          </View>
        </View>
      </View>
    </View>
 
    {/* Ações */}
    <AdminSectionLabel label="Sessão" />
    <View style={styles.fullPad}>
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={18} color={colors.destructive} />
        <Text style={styles.signOutText}>Sair da conta</Text>
      </TouchableOpacity>
    </View>
  </>
);


  const tabContent: Record<Tab, () => JSX.Element> = {
    Geral: renderGeral,
    Usuários: renderUsuarios,
    Finanças: renderFinancas,
    Atividade: renderAtividade,
    Conta: renderConta,
  };

  return (
    <Screen style={{ padding: 0 }}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={colors.primary}
            progressViewOffset={70}
          />
        }
      >
       {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Logo size="md" />
            <View style={[styles.adminBadge]}>
              <Ionicons name="shield-checkmark" size={12} color={colors.primary} />
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          </View>
          <Text style={styles.headerTitle}>Painel administrador</Text>
          <Text style={styles.headerSub}>Visão geral da plataforma</Text>
        </View>

        {/* ── Tabs ── */}
        <View style={styles.tabRow}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Conteúdo da tab ativa ── */}
        {tabContent[activeTab]()}
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
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      padding: 24,
    },
    loadingText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 8,
    },
    errorText: {
      fontSize: 14,
      color: colors.destructive,
      textAlign: "center",
    },
    retryBtn: {
      marginTop: 8,
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.primary + "10",
      borderWidth: 0.5,
      borderColor: colors.primary + "40",
    },
    retryText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 8,
      gap: 6,
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    adminBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      backgroundColor: colors.primary + "15",
      borderWidth: 0.5,
      borderColor: colors.primary + "40",
    },
    adminBadgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.primary,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
    },
    headerSub: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    tabRow: {
      flexDirection: "row",
      gap: 0,
      marginHorizontal: 16,
      marginTop: 14,
      backgroundColor: colors.glass,
      borderRadius: 12,
      padding: 3,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 7,
      borderRadius: 10,
    },
    tabActive: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: 12,
      fontWeight: "500",
      color: colors.textSecondary,
    },
    tabTextActive: {
      color: "#fff",
      fontWeight: "700",
    },
    metricsScroll: {
      paddingHorizontal: 16,
      gap: 10,
      paddingBottom: 4,
    },
    fullPad: {
      paddingHorizontal: 16,
    },
    contaHero: {
      alignItems: "center",
      paddingTop: 28,
      paddingBottom: 8,
      gap: 8,
    },
    contaAvatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary + "25",
      borderWidth: 2,
      borderColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    contaAvatarText: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.primary,
    },
    contaName: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
    },
    contaRoleBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      backgroundColor: colors.primary + "15",
      borderWidth: 0.5,
      borderColor: colors.primary + "40",
    },
    contaRoleText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.primary,
    },
    contaCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 4,
      borderWidth: 0.5,
      borderColor: colors.border,
    },
    contaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 14,
      paddingVertical: 14,
    },
    contaRowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    contaRowLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    contaRowValue: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      maxWidth: "55%",
      textAlign: "right",
    },
    contaRowDivider: {
      height: 0.5,
      backgroundColor: colors.border,
      marginHorizontal: 14,
    },
    contaRoleBadgeInline: {
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 20,
      backgroundColor: colors.primary + "15",
      borderWidth: 0.5,
      borderColor: colors.primary + "40",
    },
    contaRoleTextInline: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.primary,
    },
    signOutBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 0.5,
      borderColor: colors.destructive + "40",
    },
    signOutText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.destructive,
    },
  });