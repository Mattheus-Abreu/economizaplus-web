import useAuth from "@/hooks/useAuth";
import { Redirect, Stack } from "expo-router";

function AuthLayout() {
  const { isLoggedIn, isReady } = useAuth();

  if (!isReady) return null;

  if (isLoggedIn) {
    return <Redirect href="/(protected)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default AuthLayout;