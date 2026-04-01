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

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useAuth();

  const redirectUri = AuthSession.makeRedirectUri();
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "956093747088-67binljo0e9sai2t090900crbb6hcm68.apps.googleusercontent.com",
    iosClientId:
      "956093747088-q63rf6lnhogtpa3mvl181335m0jk90et.apps.googleusercontent.com",
    clientId:
      "956093747088-0400ghkmq73pmpuuroqnsr2p63cm49db.apps.googleusercontent.com",
    redirectUri,
  });

  async function handleGoogleSignin() {
    await promptAsync();
  }

  useEffect(() => {
    async function fetchGoogleLogin() {
      if (response?.type === "success") {
        const { authentication } = response;

        const res = await api.post("/api/login/google", {
          idToken: authentication?.idToken,
        });
        signIn(res.data.token);
        
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
                onChangeText={setEmail}
              />
              <Input
                placeholder="Senha"
                secureTextEntry
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

            <Text style={signinStyle.orText}>ou</Text>

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
