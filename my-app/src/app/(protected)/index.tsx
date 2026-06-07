import useAuth from "@/hooks/useAuth";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

/**
 * Arquivo: src/app/(protected)/index.tsx
 *
 * Porteiro do app. É a primeira tela que o Expo Router renderiza
 * ao entrar em (protected). Decide para onde o usuário vai
 * sem useEffect, sem race condition.
 */
function ProtectedIndex() {
  const { isReady, isLoggedIn, isFirstLogin } = useAuth();
  
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <Redirect href="/(auth)/signin" />;
  }

  if (isFirstLogin) {
    return <Redirect href="/educationalPage/finEducation" />;
  }

  return <Redirect href="/(protected)/(tabs)" />;
}

export default ProtectedIndex;