import useAuth from "@/hooks/useAuth";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import AppProviders from "./providers";

/**
 * Arquivo: src/app/(protected)/_layout.tsx
 *
 * Só cuida de prover contextos e registrar rotas.
 * A lógica de redirecionamento ficou no index.tsx.
 */
function ProtectedLayout() {
  const { isLoggedIn, isReady } = useAuth();

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

  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="educationalPage/finEducation" />
        <Stack.Screen name="educationalPage/IAScreen" />
      </Stack>
    </AppProviders>
  );
}

export default ProtectedLayout;