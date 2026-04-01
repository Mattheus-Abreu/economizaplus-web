import { Redirect, Stack } from "expo-router"
import { AuthProvider } from "@/contexts/authContext"
import useAuth from "@/hooks/useAuth"

function AuthLayout() {
  const { isLoggedIn, isReady } = useAuth();

  if (!isReady) return null;

  if (isLoggedIn) {
    return <Redirect href={"/(protected)/(tabs)"}/>
  }
  console.log("isLoggedIn:", isLoggedIn);
  console.log("isReady:", isReady);
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default AuthLayout