import SignUp from "@/assets/images/SignUp.svg";
import Button from "@/components/Button";
import Input from "@/components/inputs/Input";
import Screen from "@/components/Screen";
import useAuth from "@/hooks/useAuth";
import { api } from "@/services/api";
import { Link } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import signupStyle from "../../styles/signupStyle";
import theme from "../themes/theme";

function signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { signIn } = useAuth();

  async function handleSignup() {
    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      return Alert.alert(
        "Cadastrar",
        "Preencha todos os campos para cadastrar!",
      );
    }
    if (password !== confirmPassword) {
      return Alert.alert("Cadastrar", "As senhas devem ser iguais!");
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
      Alert.alert("Erro", error.response?.data.message || "Erro ao cadastrar!");
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
            <SignUp width={300} height={300} style={signupStyle.illustration} />

            <Text style={signupStyle.title}>Cadastrar</Text>
            <Text style={signupStyle.subtitle}>
              Crie sua conta para acessar.
            </Text>

            <View style={signupStyle.form}>
              <Input placeholder="Usuário" onChangeText={setName} />
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
              <Input
                placeholder="Confirme sua senha"
                secureTextEntry
                placeholderTextColor={theme.colors.textSecondary}
                onChangeText={setConfirmPassword}
              />
              <Button label="Cadastrar" onPress={handleSignup} />
            </View>

            <Text style={signupStyle.footerText}>
              Já tem conta?{" "}
              <Link href="/signin" style={signupStyle.footerLink}>
                Entre aqui
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

export default signup;
