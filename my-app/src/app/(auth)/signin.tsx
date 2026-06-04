import { api } from "@/api";
import Button from "@/components/Button";
import Input from "@/components/inputs/Input";
import Logo from "@/components/Logo";
import Screen from "@/components/Screen";
import useAuth from "@/hooks/useAuth";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import signinStyle from "@/styles/signinStyle";
import theme from "../themes/theme";
import { MODAL_HIDDEN, ModalConfig } from "@/components/modal/modal";
import AppModal from "@/components/modal/modal";

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useAuth();
  const [modal, setModal] = useState<ModalConfig>(MODAL_HIDDEN);

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
      <Screen style={signinStyle.screen}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={signinStyle.header}>
            <View style={signinStyle.logoArea}>
              <Logo size="lg" />
            </View>
            <Text style={signinStyle.title}>Bem-vindo de volta</Text>
            <Text style={signinStyle.subtitle}>
              Entre na sua conta para continuar
            </Text>
          </View>

          <View style={signinStyle.form}>
            <View style={signinStyle.field}>
              <Text style={signinStyle.fieldLabel}>email</Text>
              <View
                style={[
                  signinStyle.fieldInput,
                  email.length > 0 && signinStyle.fieldInputActive,
                ]}
              >
                <FontAwesome
                  name="envelope-o"
                  size={18}
                  color={email.length > 0 ? theme.colors.primary : "#94A3B8"}
                />
                <Input
                  style={signinStyle.inlineInput}
                  placeholder="Ex.: fulano@example.com"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>
            <View style={signinStyle.field}>
              <Text style={signinStyle.fieldLabel}>senha</Text>
              <View
                style={[
                  signinStyle.fieldInput,
                  password.length > 0 && signinStyle.fieldInputActive,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={password.length > 0 ? theme.colors.primary : "#94A3B8"}
                />
                <Input
                  style={signinStyle.inlineInput}
                  placeholder="Senha"
                  placeholderTextColor={theme.colors.textSecondary}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>
            <Text
              style={signinStyle.forgotPassword}
              onPress={handleForgotPassword}
            >
              Esqueci minha senha
            </Text>
            <Button label="Entrar" onPress={handleSignIn} />
          </View>

          <View style={signinStyle.dividerRow}>
            <View style={signinStyle.divider} />
            <Text style={signinStyle.dividerLabel}>ou</Text>
            <View style={signinStyle.divider} />
          </View>

          <Button
            label="Entrar com Google"
            onPress={handleGoogleSignin}
            style={signinStyle.googleButton}
            textStyle={{ color: "#000" }}
          >
            <FontAwesome name="google" size={24} color="black" />
          </Button>

          <Text style={signinStyle.footerText}>
            Não tem conta?{" "}
            <Link href="/signup" style={signinStyle.footerLink}>
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

export default SignInPage;
