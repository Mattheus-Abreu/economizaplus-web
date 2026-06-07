import Screen from "@/components/Screen";
import { AdminUserList } from "@/components/admin-dasboard";
import { SearchBar } from "@/components/search-bar/SearchBar";
import { useTheme } from "@/components/theme-switch/hooks";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const normalizeText = (text: string) =>
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function AdminUserListScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { users, isLoading, error, refetch } = useAdminUsers();
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const q = normalizeText(search);
    return users.filter((u) =>
      normalizeText(`${u.name} ${u.email} ${u.plan}`).includes(q)
    );
  }, [search, users]);

  return (
    <Screen style={{ padding: 0 }}>
      <StatusBar style="light" />

      {/* ── Header com SearchBar ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        <SearchBar
          containerWidth={undefined}
          tint={colors.text}
          placeholder="Pesquisar"
          onSearch={(text) => setSearch(text)}
          onClear={() => setSearch("")}
          onSearchDone={() => setSearch("")}
          style={{ flex: 1 }}
        />
      </View>

      {/* ── Hero ── */}
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Painel admin</Text>
        <Text style={styles.heroTitle}>Usuários</Text>
        <Text style={styles.heroSub}>
          {search
            ? `${filteredUsers.length} ${filteredUsers.length === 1 ? "resultado" : "resultados"} para "${search}"`
            : `${users.length} ${users.length === 1 ? "usuário cadastrado" : "usuários cadastrados"}`}
        </Text>
      </View>

      {/* ── Conteúdo ── */}
      {isLoading && users.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="warning-outline" size={36} color={colors.destructive} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="search-outline" size={36} color={colors.textSecondary} />
          <Text style={styles.emptyText}>
            Nenhum usuário encontrado para "{search}"
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
        >
          <AdminUserList
            users={filteredUsers}
            onUserPress={(user) =>
              router.push({
                pathname: "/(protected)/admin/adminUserDetail",
                params: { id: user.id },
              })
            }
            formatCurrency={(v) =>
              v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
            }
          />
        </ScrollView>
      )}
    </Screen>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    header: {
      paddingTop: 56,
      paddingBottom: 12,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.glass + "10",
      borderWidth: 0.5,
      borderColor: colors.glass,
      alignItems: "center",
      justifyContent: "center",
    },
    hero: {
      paddingVertical: 5,
      paddingLeft: 18,
      marginHorizontal: 16,
      marginBottom: 16,
      borderLeftWidth: 2,
      borderLeftColor: colors.primary,
    },
    heroLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.primary,
      letterSpacing: 1.4,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    heroTitle: {
      fontSize: 26,
      fontWeight: "700",
      color: colors.text,
      lineHeight: 32,
    },
    heroSub: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      padding: 24,
    },
    errorText: {
      fontSize: 14,
      color: colors.destructive,
      textAlign: "center",
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
    },
    retryBtn: {
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
    content: {
      paddingHorizontal: 16,
      paddingBottom: 40,
    },
  });