import useAuth from "@/hooks/useAuth"
import { Redirect, Stack } from "expo-router"
import { ActivityIndicator, View } from "react-native";
import { GoalProvider } from "@/contexts/goalContext";

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
    <GoalProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </GoalProvider>
  );
}

export default ProtectedLayout;