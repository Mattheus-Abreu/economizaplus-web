import { api } from "@/api/api";
import Button from "@/components/Button";
import Input from "@/components/inputs/Input";
import Logo from "@/components/Logo";
import Screen from "@/components/Screen";
import useAuth from "@/hooks/useAuth";
import signinStyle from "@/styles/signinStyle";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
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
import AppModal, { MODAL_HIDDEN, ModalConfig } from "@/components/modal/modal";

function signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { signIn } = useAuth();
  const [modal, setModal] = useState<ModalConfig>(MODAL_HIDDEN);

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
            <View style={signinStyle.header}>
              <View style={signinStyle.logoArea}>
                <Logo size="lg" />
              </View>
              <Text style={signinStyle.title}>Novo Por aqui?</Text>
              <Text style={signinStyle.subtitle}>
                Crie uma conta para continuar
              </Text>
            </View>

            <View style={signupStyle.form}>
              <View style={signupStyle.field}>
                <Text style={signupStyle.fieldLabel}>nome</Text>
                <View
                  style={[
                    signupStyle.fieldInput,
                    name.length > 0 && signupStyle.fieldInputActive,
                  ]}
                >
                  <FontAwesome
                    name="user-o"
                    size={18}
                    color={name.length > 0 ? theme.colors.primary : "#94A3B8"}
                  />
                  <Input
                    style={signupStyle.inlineInput}
                    placeholder="Nome"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>
              <View style={signupStyle.field}>
                <Text style={signupStyle.fieldLabel}>email</Text>
                <View
                  style={[
                    signupStyle.fieldInput,
                    email.length > 0 && signupStyle.fieldInputActive,
                  ]}
                >
                  <FontAwesome
                    name="envelope-o"
                    size={18}
                    color={email.length > 0 ? theme.colors.primary : "#94A3B8"}
                  />
                  <Input
                    style={signupStyle.inlineInput}
                    placeholder="Ex.: fulano@example.com"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>
              <View style={signupStyle.field}>
                <Text style={signupStyle.fieldLabel}>senha</Text>
                <View
                  style={[
                    signupStyle.fieldInput,
                    password.length > 0 && signupStyle.fieldInputActive,
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
                    style={signupStyle.inlineInput}
                    placeholder="Senha"
                    placeholderTextColor={theme.colors.textSecondary}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
              </View>
              <View style={signupStyle.field}>
                <Text style={signupStyle.fieldLabel}>confirmar senha</Text>
                <View
                  style={[
                    signupStyle.fieldInput,
                    confirmPassword.length > 0 && signupStyle.fieldInputActive,
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
                    style={signupStyle.inlineInput}
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

            <Text style={signupStyle.footerText}>
              Já tem conta?{" "}
              <Link href="/signin" style={signupStyle.footerLink}>
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

export default signup;
