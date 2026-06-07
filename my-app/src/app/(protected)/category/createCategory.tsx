import Button from "@/components/Button";
import Input from "@/components/inputs/Input";
import AppModal, { MODAL_HIDDEN, ModalConfig } from "@/components/modal/modal";
import Screen from "@/components/Screen";
import { useCategory } from "@/contexts/categoryContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { ComponentProps } from "react";
import { useState } from "react";
import {
  LayoutAnimation,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type IconName = ComponentProps<typeof FontAwesome>["name"];

const PRESET_COLORS = [
  "#EF4444", "#F97316", "#EAB308", "#22C55E", "#10B981",
  "#14B8A6", "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6",
  "#A855F7", "#EC4899", "#F43F5E", "#64748B", "#FBBF24",
  "#0EA5E9", "#84CC16", "#FB923C",
];

const ICON_LIST: IconName[] = [
  "home", "credit-card", "shopping-bag", "shopping-cart", "car", "film",
  "line-chart", "dollar", "gamepad", "gift", "plane", "pencil",
  "heartbeat", "cutlery", "book", "bicycle", "music", "coffee",
  "university", "medkit", "wifi", "bolt", "leaf", "wrench",
];

const LAYOUT_ANIM = {
  duration: 200,
  create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
  update: { type: LayoutAnimation.Types.easeInEaseOut },
  delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
};

function createCategory() {
  const { width } = useWindowDimensions();
  const [modal, setModal] = useState<ModalConfig>(MODAL_HIDDEN);
  const router = useRouter();
  const { addCategory, updateCategory } = useCategory();
  const params = useLocalSearchParams<{ id?: string; name?: string; icon?: IconName; color?: string }>();
  const isEditing = !!params.id;
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const [color, setColor] = useState(params.color ?? PRESET_COLORS[5]);
  const [icon, setIcon] = useState<IconName>((params.icon as IconName) ?? "home");
  const [name, setName] = useState(params.name ?? "");

  const iconScale = useSharedValue(1);
  const colorPulse = useSharedValue(1);

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const colorPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: colorPulse.value }],
  }));

  function handleColorChange(newColor: string) {
    LayoutAnimation.configureNext(LAYOUT_ANIM);
    setColor(newColor);
    colorPulse.value = withSequence(
      withTiming(0.82, { duration: 60 }),
      withTiming(1, { duration: 80 })
    );
  }

  function handleIconChange(newIcon: IconName) {
    LayoutAnimation.configureNext(LAYOUT_ANIM);
    setIcon(newIcon);
    iconScale.value = withSequence(
      withTiming(0, { duration: 70 }),
      withTiming(1, { duration: 100 })
    );
  }

  async function handleSubmit() {
    if (!name.trim() || !icon || !color)
      return setModal({
        visible: true,
        variant: "warning",
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos para continuar.",
        buttons: [{ label: "Ok", onPress: () => setModal(MODAL_HIDDEN), variant: "secondary" }],
      });
    try {
      if (isEditing) await updateCategory(params.id!, { name, icon, color });
      else await addCategory({ name, icon, color, type: "custom" });
      router.back();
    } catch (error: any) {
      setModal({
        visible: true,
        variant: "error",
        title: "Erro",
        description: error.message,
        buttons: [{ label: "Fechar", onPress: () => setModal(MODAL_HIDDEN), variant: "secondary" }],
      });
    }
  }

  const iconAreaWidth = width - 48;
  const ICON_COLS = 6;
  const iconTileSize = Math.floor((iconAreaWidth - (ICON_COLS - 1) * 8) / ICON_COLS);
  const COLOR_COLS = 9;
  const swatchSize = Math.floor((iconAreaWidth - (COLOR_COLS - 1) * 8) / COLOR_COLS);

  return (
    <Screen style={{ padding: 0 }}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>
            {isEditing ? "Editar categoria" : "Criar categoria"}
          </Text>
          <Text style={styles.heroTitle}>
            {isEditing ? "Edite sua categoria" : "Crie uma nova categoria"}
          </Text>
          <Text style={styles.heroSub}>
            {isEditing
              ? "Preencha os campos abaixo para editar sua categoria."
              : "Preencha os campos abaixo para criar uma nova categoria."}
          </Text>
        </View>

        {/* Name field */}
        <View style={styles.section}>
          <View style={[styles.fieldInput, name.length > 0 && styles.fieldInputActive]}>
            <Ionicons
              name="pencil"
              size={18}
              color={name.length > 0 ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Input
              style={styles.inlineInput}
              placeholder="Ex: Lazer"
              placeholderTextColor={theme.colors.textSecondary}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        {/* Icon picker */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Ícone</Text>
          <View style={styles.iconGrid}>
            {ICON_LIST.map((iconName) => {
              const selected = icon === iconName;
              return (
                <TouchableOpacity
                  key={iconName}
                  style={[
                    styles.iconTile,
                    { width: iconTileSize, height: iconTileSize },
                    selected && { backgroundColor: color + "30", borderColor: color },
                  ]}
                  onPress={() => handleIconChange(iconName)}
                  activeOpacity={0.65}
                >
                  <FontAwesome
                    name={iconName}
                    size={18}
                    color={selected ? color : theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Color picker */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Cor</Text>
          <View style={styles.colorGrid}>
            {PRESET_COLORS.map((c) => {
              const selected = color === c;
              return (
                <Pressable
                  key={c}
                  style={[
                    styles.swatch,
                    { width: swatchSize, height: swatchSize, backgroundColor: c },
                    selected && styles.swatchSelected,
                  ]}
                  onPress={() => handleColorChange(c)}
                >
                  {selected && (
                    <FontAwesome name="check" size={12} color="#fff" />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Preview */}
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerLabel}>Prévia</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.previewWrapper}>
          <View style={styles.previewCard}>
            <Animated.View style={[styles.previewColorBar, { backgroundColor: color }, colorPulseStyle]} />
            <Animated.View style={[styles.previewIconWrap, { backgroundColor: color + "25" }, colorPulseStyle]}>
              <Animated.View style={iconAnimStyle}>
                <FontAwesome name={icon} size={20} color={color} />
              </Animated.View>
            </Animated.View>
            <View style={styles.previewMiddle}>
              <Text style={styles.previewName} numberOfLines={1}>
                {name.trim() || "Nome da categoria"}
              </Text>
              <Text style={styles.previewMeta}>0 transações</Text>
            </View>
            <View style={styles.previewRight}>
              <Text style={[styles.previewAmount, { color: theme.colors.textSecondary }]}>—</Text>
            </View>
          </View>
        </View>

        {/* Submit */}
        <View style={styles.submitWrap}>
          <Button
            label={isEditing ? "Salvar alterações" : "Criar categoria"}
            onPress={handleSubmit}
          />
        </View>
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

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    scroll: { paddingBottom: 48 },
    header: { paddingTop: 56, paddingHorizontal: 24, paddingBottom: 4 },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.colors.glass + "5",
      borderWidth: 0.5,
      borderColor: theme.colors.glass,
      alignItems: "center",
      justifyContent: "center",
    },
    hero: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 28 },
    heroLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: theme.colors.primary,
      letterSpacing: 1.4,
      textTransform: "uppercase",
      marginBottom: 8,
    },
    heroTitle: { fontSize: 28, fontWeight: "700", color: theme.colors.text, lineHeight: 34 },
    heroSub: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 8, lineHeight: 18 },
    section: { paddingHorizontal: 24, marginBottom: 18, gap: 10 },
    sectionLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    fieldInput: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: 14,
      height: 54,
      paddingHorizontal: 16,
      backgroundColor: "rgba(255,255,255,0.04)",
      borderWidth: 0.5,
      borderColor: "rgba(255,255,255,0.1)",
    },
    fieldInputActive: {
      borderColor: theme.colors.primary,
      backgroundColor: "rgba(124,58,237,0.06)",
    },
    inlineInput: {
      flex: 1,
      height: 54,
      backgroundColor: "transparent",
      borderWidth: 0,
      borderRadius: 0,
      paddingHorizontal: 0,
    },
    iconGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    iconTile: {
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.05)",
      borderWidth: 1.5,
      borderColor: "rgba(255,255,255,0.08)",
    },
    colorGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    swatch: { borderRadius: 8, justifyContent: "center", alignItems: "center" },
    swatchSelected: { borderWidth: 2.5, borderColor: "#fff" },
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 24,
      marginBottom: 20,
      gap: 12,
    },
    divider: { flex: 1, height: 0.5, backgroundColor: "rgba(255,255,255,0.08)" },
    dividerLabel: {
      fontSize: 11,
      fontWeight: "500",
      color: theme.colors.textSecondary,
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    previewWrapper: { paddingHorizontal: 24, marginBottom: 28 },
    previewCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: 18,
      borderWidth: 0.5,
      borderColor: "rgba(255,255,255,0.07)",
      overflow: "hidden",
      padding: 14,
      gap: 12,
    },
    previewColorBar: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      borderTopLeftRadius: 18,
      borderBottomLeftRadius: 18,
    },
    previewIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 8,
    },
    previewMiddle: { flex: 1, gap: 3 },
    previewName: { fontSize: 15, fontWeight: "600", color: theme.colors.text },
    previewMeta: { fontSize: 12, color: theme.colors.textSecondary },
    previewRight: { alignItems: "flex-end" },
    previewAmount: { fontSize: 15, fontWeight: "700" },
    submitWrap: { paddingHorizontal: 24 },
  });

export default createCategory;
