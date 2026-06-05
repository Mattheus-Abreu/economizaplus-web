import Button from "@/components/Button";
import { Dialog } from "@/components/dialog";
import Icons from "@/components/Icons";
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
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {
  BaseButton,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import ColorPicker from "react-native-wheel-color-picker";

type IconName = ComponentProps<typeof FontAwesome>["name"];

function createCategory() {
  const { width } = useWindowDimensions();
  const [modal, setModal] = useState<ModalConfig>(MODAL_HIDDEN);
  const router = useRouter();
  const { addCategory, updateCategory } = useCategory();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    icon?: IconName;
    color?: string;
  }>();
  const isEditing = !!params.id;
  const theme = useAppTheme();
  const styles = createStyles(theme);


  const [color, setColor] = useState(params.color ?? theme.colors.text);
  const [icon, setIcon] = useState<IconName>(
    (params.icon as IconName) ?? "home"
  );
  const [name, setName] = useState(params.name ??"");
  

  const icons: IconName[] = [
    "home",
    "credit-card",
    "shopping-bag",
    "car",
    "film",
    "line-chart",
    "dollar",
    "gamepad",
    "gift",
    "plane",
    "pencil",
  ];

  async function handleSubmit() {
    if (!name.trim() || !icon || !color) 
      return setModal({
        visible: true,
        variant: "warning",
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos para continuar."
      });
    try {
      if(isEditing){
        await updateCategory(params.id!, {
          name,
          icon,
          color,
        });
        setModal({
          visible: true,
          variant: "success",
          title: "Sucesso",
          description: "Categoria atualizada com sucesso!"
        });
      } else {
        await addCategory({
          name,
          icon,
          color,
          type: "custom",
        });
        setModal({
          visible: true,
          variant: "success",
          title: "Sucesso",
          description: "Categoria criada com sucesso!"
        });
      }
      router.back();
    } catch (error: any) {
      setModal({
        visible: true,
        variant: "error",
        title: "Erro",
        description: error.message,
      });
    }

  }

  return (
    <Screen style={{ padding: 0 }}>
      <GestureHandlerRootView>
        <StatusBar style="light" />

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <FontAwesome name="arrow-left" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

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

        <View style={styles.form}>
          <View
            style={[
              styles.fieldInput,
              name.length > 0 && styles.fieldInputActive,
            ]}
          >
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
          <View>
            <Text style={styles.fieldLabel}>Escolha um ícone</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {icons.map((iconName) => (
              <TouchableOpacity
                key={iconName}
                onPress={() => setIcon(iconName)}
              >
                <FontAwesome
                  name={iconName}
                  size={24}
                  color={icon === iconName ? color : "gray"}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Dialog>
          <Dialog.Trigger>
            <View style={[styles.field, { padding: 25 }]}>
              <BaseButton>
                <View style={[styles.fieldInput, styles.fieldInputActive]}>
                  <Text style={styles.fieldLabel}>Selecione uma cor</Text>
                </View>
              </BaseButton>
            </View>
          </Dialog.Trigger>

          <Dialog.Backdrop blurAmount={25} backgroundColor="rgba(0,0,0,0.7)" />

          <Dialog.Content>
            <View style={[styles.content, { width: width - 48 }]}>
              <Text style={[styles.title]}>Selecione uma cor</Text>

              <Text style={[styles.subtitle]}>
                Adicione cor as suas categorias
              </Text>

              <View style={styles.colorPicker}>
                <ColorPicker color={color} onColorChange={setColor} />
              </View>

              <View style={styles.actions}>
                <Dialog.Close asChild>
                  <Pressable style={[styles.btn, styles.cancelBtn]}>
                    <Text style={[styles.cancelText]}>Cancelar</Text>
                  </Pressable>
                </Dialog.Close>

                <Dialog.Close asChild>
                  <Pressable style={[styles.btn, styles.deleteBtn]}>
                    <Text style={[styles.deleteText]}>Confirmar</Text>
                  </Pressable>
                </Dialog.Close>
              </View>
            </View>
          </Dialog.Content>
        </Dialog>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerLabel}>Prévia</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.previewWrapper}>
          <View style={styles.previewCard}>
            <Icons name={icon} label={name} color={color} />
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Button label={isEditing ? "Salvar alterações" : "Criar categoria"} onPress={handleSubmit} />
        </View>
      </GestureHandlerRootView>
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
  header: {
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 4,
  },
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
  hero: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.primary,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text,
    lineHeight: 34,
  },
  heroSub: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 8,
    lineHeight: 18,
  },
  form: {
    paddingHorizontal: 24,
    gap: 16,
  },
  trigger: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.glass + "5",
    borderColor: theme.colors.glass,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: theme.colors.glass + "5",
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    alignSelf: "center",
  },
  btnText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  colorPicker: {
    width: "100%",
    height: 200,
    marginBottom: 100,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.glass + "5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  inlineInput: {
    flex: 1,
    height: 54,
    backgroundColor: "transparent",
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginBottom: 28,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  btn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: theme.colors.glass + "5",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  deleteBtn: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: theme.colors.primary,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: theme.colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingLeft: 2,
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
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 28,
    marginBottom: 16,
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  dividerLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: theme.colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  previewWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  previewCard: {
    borderRadius: 18,
    alignSelf: "center",
    alignItems: "center",
  },
  previewLeft: {
    flex: 1,
    marginRight: 16,
  },
  previewName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
});

export default createCategory;
