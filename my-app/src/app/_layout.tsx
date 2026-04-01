import { AuthProvider } from "@/contexts/authContext"
import { Stack } from "expo-router"

function RootLayout() {
  return (
    <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(protected)" />
      </Stack>
    </AuthProvider>
  );
}

export default RootLayout