import { api } from "@/api";
import Button from "@/components/Button";
import Input from "@/components/inputs/Input";
import Logo from "@/components/Logo";
import AppModal, { MODAL_HIDDEN, ModalConfig } from "@/components/modal/modal";
import Screen from "@/components/Screen";
import { useAppTheme } from "@/hooks/useAppTheme";
import useAuth from "@/hooks/useAuth";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useAuth();
  const [modal, setModal] = useState<ModalConfig>(MODAL_HIDDEN);
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const redirectUri = "https://auth.expo.io/@rdavila_mesquita/my-app";

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId:
      "956093747088-0400ghkmq73pmpuuroqnsr2p63cm49db.apps.googleusercontent.com",
    redirectUri,
    scopes: ["openid", "profile", "email"],
  });

  async function handleGoogleSignin() {
    await promptAsync();
  }

  useEffect(() => {
    async function fetchGoogleLogin() {
      if (response?.type !== "success") return;

      const idToken = response.authentication?.idToken;
      if (!idToken) {
        setModal({
          visible: true,
          variant: "warning",
          title: "Erro",
          description: "Erro ao autenticar com Google",
        });
        return;
      }

      try {
        const res = await api.post("/api/login/google", { idToken });
        signIn(res.data.token);
      } catch (error: any) {
        setModal({
          visible: true,
          variant: "warning",
          title: "Erro",
          description: "Erro ao autenticar com Google",
        })
      }
    }

    fetchGoogleLogin();
  }, [response]);

  async function handleSignIn() {
    if (!email.trim() || !password.trim()) {
      return setModal({
        visible: true,
        variant: "warning",
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos para continuar",
      })
    }
    try {
      const response = await api.post("/api/login", {
        email,
        password,
      });
      signIn(response.data.token);
    } catch (error: any) {
      console.log(error.response?.data);
      setModal({
        visible: true,
        variant: "warning",
        title: "Erro",
        description: error.response?.data.message,
      })
    }
  }
  async function handleForgotPassword() {
    if (!email.trim()) {
      return setModal({
        visible: true,
        variant: "warning",
        title: "Esqueci minha senha",
        description: "Por favor, informe seu email para recuperar sua senha",
      })
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: "padding" })}
    >
      <Screen style={styles.screen}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoArea}>
              <Logo size="lg" />
            </View>
            <Text style={styles.title}>Bem-vindo de volta</Text>
            <Text style={styles.subtitle}>
              Entre na sua conta para continuar
            </Text>
          </View>

          <View style={styles.form}>
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
                  color={password.length > 0 ? theme.colors.primary : "#94A3B8"}
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
            <Text
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
            >
              Esqueci minha senha
            </Text>
            <Button label="Entrar" onPress={handleSignIn} />
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerLabel}>ou</Text>
            <View style={styles.divider} />
          </View>

          <Button
            label="Entrar com Google"
            onPress={handleGoogleSignin}
            style={styles.googleButton}
            textStyle={{ color: "#000" }}
          >
            <FontAwesome name="google" size={24} color="black" />
          </Button>

          <Text style={styles.footerText}>
            Não tem conta?{" "}
            <Link href="/signup" style={styles.footerLink}>
              Cadastre-se aqui
            </Link>
          </Text>
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
    </KeyboardAvoidingView>
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
  orText: {
    textAlign: "center",
    padding: 12,
    fontSize: theme.fontSize.text,
    fontWeight: 400,
    color: theme.colors.text,
  },
  illustration: {
    resizeMode: "contain",
    marginTop: 62,
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
  googleButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    width: "100%",
    height: 54,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 16,
    fontWeight: 800,
  },
  forgotPassword: {
    fontSize: 12,
    textAlign: "right",
    color: "#d4dee6",
    marginBottom: 20,
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
    dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 16,
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
  })

export default SignInPage;
