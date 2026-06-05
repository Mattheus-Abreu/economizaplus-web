import { useAppTheme } from "@/hooks/useAppTheme";
import { StyleSheet } from "react-native";

export const createTabBarStyle = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    tabbar: {
      position: "absolute",
      bottom: 20,
      left: 20,
      right: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",

      backgroundColor: theme.colors.surface,

      paddingVertical: 14,
      borderRadius: 30,

      borderWidth: 1.5,
      borderColor: theme.colors.glass,

      shadowColor: theme.colors.mutedForeground,
      shadowOpacity: 0.2,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 5 },
      elevation: 2,
    },

    tabbarItem: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 4,
    },
  });