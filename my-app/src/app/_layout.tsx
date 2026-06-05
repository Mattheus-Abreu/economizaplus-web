import { darkTheme, lightTheme } from "@/components/theme-switch/conf";
import { ThemeMode, ThemeProvider } from "@/components/theme-switch/context";
import { AuthContext, AuthProvider } from "@/contexts/authContext";

import { Stack } from "expo-router";
import { useContext } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider as PaperProvider } from "react-native-paper";

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

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider
        defaultTheme={ThemeMode.Dark}
        customDarkColors={darkTheme}
        customLightColors={lightTheme}
      >
        <PaperProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </PaperProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}