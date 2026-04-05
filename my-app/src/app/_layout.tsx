import { AuthContext, AuthProvider } from "@/contexts/authContext"
import { GoalProvider } from "@/contexts/goalContext";
import { Stack } from "expo-router"
import { useContext } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler"


function AppContent() {
  const { isLoggedIn, isReady } = useContext(AuthContext);

  if (!isReady) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <Stack.Screen name="(auth)" />
      ) : (
        <Stack.Screen name="(protected)" />
      )}
    </Stack>
  );
}
function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

export default RootLayout