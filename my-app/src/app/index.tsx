import { Redirect } from "expo-router";
import useAuth from "@/hooks/useAuth";

function Index() {
  const { isLoggedIn, isReady } = useAuth();

  if (!isReady) return null;

  return <Redirect href={isLoggedIn ? "/(protected)/(tabs)" : "/(auth)/signin"} />;
}

export default Index;