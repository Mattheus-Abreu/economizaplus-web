import useAuth from "@/hooks/useAuth"
import { Redirect, Stack } from "expo-router"
import { ActivityIndicator, View } from "react-native";

function ProtectedLayout() {
  const { isLoggedIn, isReady } = useAuth();

  if (!isReady) null;

  if (!isLoggedIn) {
    return <Redirect href="/(auth)/signin" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default ProtectedLayout