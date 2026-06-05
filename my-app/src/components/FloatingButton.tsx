import { useAppTheme } from "@/hooks/useAppTheme";
import { FontAwesome } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";

type Props = {
  onPress: () => void;
  icon?: keyof typeof FontAwesome.glyphMap;
  size?: number;
  style?: ViewStyle;
};

export default function FloatingButton({
  onPress,
  icon = "plus",
  size = 52,
  style,
}: Props) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  return (
    <TouchableOpacity
      activeOpacity={0.85}
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
      <FontAwesome name={icon} size={20} color="#fff" />
    </TouchableOpacity>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    button: {
      position: "absolute",
      bottom: 24,
      right: 24,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.45,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
    },
  });
