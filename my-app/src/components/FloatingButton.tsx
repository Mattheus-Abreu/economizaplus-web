import React from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import theme from "@/app/themes/theme";

type Props = {
  onPress: () => void;
  icon?: keyof typeof FontAwesome.glyphMap;
  size?: number;
  style?: ViewStyle;
};

export default function FloatingButton({
  onPress,
  icon = "plus",
  size = 80,
  style,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      <FontAwesome name={icon} size={30} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 24,
    right: 24,
    justifyContent: "center",
    alignItems: "center",

    backgroundColor: theme.colors.primary,

    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
});