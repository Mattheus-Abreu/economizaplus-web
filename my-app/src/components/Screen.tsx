import { View, StyleSheet, ViewProps } from "react-native";
import theme from "@/app/themes/theme";

type ScreenProps = ViewProps & {
  children: React.ReactNode;
};

function Screen({ children, style, ...rest }: ScreenProps) {
  return (
    <View style={[styles.container, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    justifyContent: "center",
    alignContent:"center"
  }
});

export default Screen;