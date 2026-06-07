import useAuth from "@/hooks/useAuth";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import AppProviders from "./providers";

function ProtectedLayout() {
  const { isLoggedIn, isReady, user } = useAuth();

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

  if (user?.role === "ADMIN") {
    return (
      <AppProviders>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="admin/adminPage" />
        </Stack>
        <Redirect href="/(protected)/admin/adminPage" />
      </AppProviders>
    );
  }

  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="educationalPage/finEducation" />
        <Stack.Screen name="educationalPage/IAScreen" />
        <Stack.Screen name="admin/adminPage" />
      </Stack>
    </AppProviders>
  );
}

export default ProtectedLayout;