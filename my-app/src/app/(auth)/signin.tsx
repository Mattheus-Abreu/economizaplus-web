import SignIn from "@/assets/images/SignIn.svg";
import Button from "@/components/Button";
import Input from "@/components/inputs/Input";
import Screen from "@/components/Screen";
import useAuth from "@/hooks/useAuth";
import { api } from "@/services/api";
import { FontAwesome } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import signinStyle from "../../styles/signinStyle";
import theme from "../themes/theme";

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useAuth();

  const redirectUri = "https://auth.expo.io/@rdavila_mesquita/my-app";

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "956093747088-0400ghkmq73pmpuuroqnsr2p63cm49db.apps.googleusercontent.com",
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
        Alert.alert("Erro", "Não foi possível obter o token do Google");
        return;
      }

      try {
        const res = await api.post("/api/login/google", { idToken });
        signIn(res.data.token);
      } catch (error: any) {
        Alert.alert("Erro", error.response?.data?.error || "Erro ao autenticar com Google");
      }
    }

    fetchGoogleLogin();
  }, [response]);

  async function handleSignIn() {
    if (!email.trim() || !password.trim()) {
      return Alert.alert("Entrar", "Preencha e-mail e senha para entrar!");
    }
    try {
      const response = await api.post("/api/login", {
        email,
        password,
      });
      signIn(response.data.token);
    } catch (error: any) {
      console.log(error.response?.data);
      Alert.alert(
        "Erro",
        error.response?.data.message || "erro ao fazer login!",
      );
    }
  }
  async function handleForgotPassword() {
    if (!email.trim()) {
      return Alert.alert(
        "Esqueci minha senha",
        "Informe seu e-mail para recuperar a senha!",
      );
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: "padding" })}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Screen>
          <View>
            <SignIn width={300} height={300} style={signinStyle.illustration} />

            <Text style={signinStyle.title}>Entrar</Text>

            <View style={signinStyle.form}>
              <Input
                placeholder="E-mail"
                keyboardType="email-address"
                placeholderTextColor={theme.colors.textSecondary}
                onChangeText={setEmail}
              />
              <Input
                placeholder="Senha"
                secureTextEntry
                placeholderTextColor={theme.colors.textSecondary}
                onChangeText={setPassword}
              />
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
          </View>
        </Screen>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default SignInPage;
