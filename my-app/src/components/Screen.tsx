import { useAppTheme } from "@/hooks/useAppTheme";
import { StyleSheet, View, ViewProps } from "react-native";

type ScreenProps = ViewProps & {
  children: React.ReactNode;
};

function Screen({ children, style, ...rest }: ScreenProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  return (
    <View style={[styles.container, style]} {...rest}>
      {children}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => 
StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    justifyContent: "center",
    alignContent:"center"
  }
});

export default Screen;