import { api } from "@/api/api";
import Button from "@/components/Button";
import Input from "@/components/inputs/Input";
import Logo from "@/components/Logo";
import AppModal, { MODAL_HIDDEN, ModalConfig } from "@/components/modal/modal";
import Screen from "@/components/Screen";
import { useAppTheme } from "@/hooks/useAppTheme";
import useAuth from "@/hooks/useAuth";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

function signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { signIn } = useAuth();
  const [modal, setModal] = useState<ModalConfig>(MODAL_HIDDEN);
  const theme = useAppTheme();
  const styles = createStyles(theme);

  async function handleSignup() {
    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      return setModal({
        visible: true,
        variant: "warning",
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos para continuar."
      })
    }
    if (password !== confirmPassword) {
      return setModal({
        visible: true,
        variant: "warning",
        title: "Senhas diferentes",
        description: "As senhas devem ser iguais!"
      });
    }

    try {
      const response = await api.post("/api/users/register", {
        name,
        email,
        password,
      });
      signIn(response.data.token);
    } catch (error: any) {
      console.log(error.response?.data);
      setModal({
        visible: true,
        variant: "warning",
        title: "Erro ao cadastrar",
        description: error.response?.data.message || "Erro ao cadastrar!"
      });
    }
  }
  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: "padding" })}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View>
            <View style={styles.header}>
              <View style={styles.logoArea}>
                <Logo size="lg" />
              </View>
              <Text style={styles.title}>Novo Por aqui?</Text>
              <Text style={styles.subtitle}>
                Crie uma conta para continuar
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>nome</Text>
                <View
                  style={[
                    styles.fieldInput,
                    name.length > 0 && styles.fieldInputActive,
                  ]}
                >
                  <FontAwesome
                    name="user-o"
                    size={18}
                    color={name.length > 0 ? theme.colors.primary : "#94A3B8"}
                  />
                  <Input
                    style={styles.inlineInput}
                    placeholder="Nome"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>email</Text>
                <View
                  style={[
                    styles.fieldInput,
                    email.length > 0 && styles.fieldInputActive,
                  ]}
                >
                  <FontAwesome
                    name="envelope-o"
                    size={18}
                    color={email.length > 0 ? theme.colors.primary : "#94A3B8"}
                  />
                  <Input
                    style={styles.inlineInput}
                    placeholder="Ex.: fulano@example.com"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>senha</Text>
                <View
                  style={[
                    styles.fieldInput,
                    password.length > 0 && styles.fieldInputActive,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={
                      password.length > 0 ? theme.colors.primary : "#94A3B8"
                    }
                  />
                  <Input
                    style={styles.inlineInput}
                    placeholder="Senha"
                    placeholderTextColor={theme.colors.textSecondary}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>confirmar senha</Text>
                <View
                  style={[
                    styles.fieldInput,
                    confirmPassword.length > 0 && styles.fieldInputActive,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={
                      confirmPassword.length > 0
                        ? theme.colors.primary
                        : "#94A3B8"
                    }
                  />
                  <Input
                    style={styles.inlineInput}
                    placeholder="Confirmar Senha"
                    placeholderTextColor={theme.colors.textSecondary}
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>
              </View>
              <Button label="Cadastrar" onPress={handleSignup} />
            </View>

            <Text style={styles.footerText}>
              Já tem conta?{" "}
              <Link href="/signin" style={styles.footerLink}>
                Entre aqui
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    screen: {
    padding: 24,
    justifyContent: "center",
  },
  logoArea: {
    alignItems: "center",
    marginBottom: 36,
  },
  logo:{
    paddingTop: 20,
    paddingBottom: 20
  },
  header:{
    paddingTop: 100,
    paddingBottom: 30,
    justifyContent: "center",
    alignItems:"center"
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text,
    lineHeight: 34,
  },
  subtitle:{
    fontSize: theme.fontSize.text,
    fontWeight: 400,
    color: theme.colors.textSecondary
  },
  illustration: {
    resizeMode: "contain",
    marginTop: 30,
  },
  form: {
    marginTop: 24,
    gap: 16,
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
    inlineInput: {
    flex: 1,
    height: 54,
    backgroundColor: "transparent",
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: 0,
  },
  footerText: {
    textAlign: "center",
    marginTop: 24,
    color: "#d4dee6",
  },
  footerLink: {
    color: theme.colors.primary,
    fontWeight: 700,
  },
  })

export default signup;
