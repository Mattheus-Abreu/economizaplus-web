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
import Screen from "@/components/Screen";
import { useTheme } from "@/components/theme-switch/hooks";
import { useAdminStats } from "@/hooks/useAdminStats";
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
const TABS = ["Geral", "Usuários", "Finanças", "Atividade"] as const;
type Tab = (typeof TABS)[number];

function formatBRL(value: number) {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(1).replace(".", ",")}k`;
  }
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function AdminDashboard() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [activeTab, setActiveTab] = useState<Tab>("Geral");

  const { data, isLoading, isError, error, refetch } = useAdminStats();

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
            onAction={() => {
              /* router.push para lista completa */
            }}
          />
          <View style={styles.fullPad}>
            <AdminUserList
              users={topUsers}
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

  const tabContent: Record<Tab, () => JSX.Element> = {
    Geral: renderGeral,
    Usuários: renderUsuarios,
    Finanças: renderFinancas,
    Atividade: renderAtividade,
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
          />
        }
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Painel admin</Text>
            <Text style={styles.headerSub}>Visão geral da plataforma</Text>
          </View>
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
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 8,
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
  });