import { useTheme } from "@/components/theme-switch/hooks";
import { AnimationType } from "@/components/theme-switch/types";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { SymbolView } from "expo-symbols";
import { Platform, Pressable, StyleSheet, View } from "react-native";

export default function ProfileScreen() {
  const { colors, toggleTheme, isDark } = useTheme();

  return (
    <>
      <StatusBar animated style={isDark ? "light" : "dark"} />
      <View style={[styles.screen, { backgroundColor: colors.background }]}>

        <Pressable
          style={[
            styles.fab,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
          onPress={(e) =>
            toggleTheme({
              animationType: isDark
                ? AnimationType.CircularInverted
                : AnimationType.Circular,
              touchX: e.nativeEvent.pageX,
              touchY: e.nativeEvent.pageY,
            })
          }
        >
          {Platform.OS === "ios" ? (
            <SymbolView
              name={isDark ? "moon.fill" : "sun.max.fill"}
              size={20}
              tintColor={colors.text}
            />
          ) : (
            <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={colors.text} />
          )}
        </Pressable>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  center: {
    flex: 1,
    alignItems: "center",
    gap: 10,
    top: 180,
  },

  title: {
    fontSize: 26,
    fontWeight: "600",
    letterSpacing: -0.3,
  },

  subtitle: {
    fontSize: 14,
  },

  fab: {
    position: "absolute",
    top: 62,
    left: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
});
