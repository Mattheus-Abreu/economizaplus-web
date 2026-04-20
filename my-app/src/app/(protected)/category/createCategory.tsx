import {
  View,
  StyleSheet,
  Text,
  Pressable,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { BaseButton, GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { Dialog } from "@/components/dialog";
import ColorPicker from 'react-native-wheel-color-picker';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from "react";
import React, { useState } from "react";
import Input from "@/components/inputs/Input";
import Button from "@/components/Button";
import { router } from "expo-router";
import theme from "@/app/themes/theme";
import Icons from "@/components/Icons";

type IconName = ComponentProps<typeof FontAwesome>["name"];

function createCategory<T>() {
  const { width } = useWindowDimensions();
  const [color, setColor] = useState("#fff");
  const [icon, setIcon] = useState<IconName>("home");
  const [name, setName] = useState("");

  const icons: IconName[] = [
  "home",
  "credit-card",
  "shopping-bag",
  "car",
  "bullseye",
  "calendar",
  "user",
  "cog",
  "gift",
  "plane",
  "pencil",
];

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} >
            <FontAwesome
              name="arrow-left"
              size={16}
              color={"#94A3B8"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>
            Nova categoria
          </Text>
          <Text style={styles.heroTitle}>
            Adicione uma nova categoria
          </Text>
          <Text style={styles.heroSub}>
            Se organize melhor para cumprir seu objetivos
          </Text>
        </View>

      <View style={styles.form}>
      <View style={[styles.fieldInput, name.length > 0 && styles.fieldInputActive]}>
        <Ionicons
            name="pencil"
            size={18}
            color={name.length > 0 ? theme.colors.primary : "#94A3B8"}
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
          <TouchableOpacity key={iconName} onPress={() => setIcon(iconName)}>
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
            <BaseButton >
              <View style={[styles.fieldInput, styles.fieldInputActive]}>
                <Text style={styles.fieldLabel}>Selecione uma cor</Text>
              </View>
            </BaseButton>
          </View>
        </Dialog.Trigger>

        <Dialog.Backdrop blurAmount={25} backgroundColor="rgba(0,0,0,0.7)" />

        <Dialog.Content>
          <View style={[styles.content, { width: width - 48 }]}>

            <Text
              style={[
                styles.title,
                
              ]}
            >
              Selecione uma cor
            </Text>

            <Text
              style={[
                styles.subtitle,
                
              ]}
            >
              Adicione cor as suas categorias
            </Text>

            <View style={styles.colorPicker}>
              <ColorPicker
                color={color}
                onColorChange={setColor}
              />
            </View>

            <View style={styles.actions}>
              <Dialog.Close asChild>
                <Pressable style={[styles.btn, styles.cancelBtn]}>
                  <Text
                    style={[
                      styles.cancelText,
                     
                    ]}
                  >
                    Cancelar
                  </Text>
                </Pressable>
              </Dialog.Close>

              <Dialog.Close asChild>
                <Pressable style={[styles.btn, styles.deleteBtn]}>
                  <Text
                    style={[
                      styles.deleteText,
                      
                    ]}
                  >
                    Confirmar
                  </Text>
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
            <Icons
              name={icon}
              label={name}
              color={color}
            />
          </View>
        </View>

      <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
        <Button label="Criar categoria"/>
      </View>
      
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#100420",
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
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
    color: "#7C3AED",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 34,
  },
  heroSub: {
    fontSize: 13,
    color: "#94A3B8",
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
    backgroundColor: "#1A1333",
    borderColor: "rgba(255,255,255,0.06)",
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: "#1A1333",
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    alignSelf: "center",
  },
  btnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  colorPicker:{
    width: "100%",
    height: 200,
    marginBottom: 100
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,107,107,0.15)",
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
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#8e8e93",
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
    backgroundColor: "#434344",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  deleteBtn: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#7C3AED",
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
    color: "#8e8e93",
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
    borderColor: "#7C3AED",
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
    color: "#fff",
  },
});

export default createCategory;