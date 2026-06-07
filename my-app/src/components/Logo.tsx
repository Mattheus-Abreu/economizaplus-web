import { useAppTheme } from "@/hooks/useAppTheme";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: { name: 16, plus: 20, bar: 24 },
  md: { name: 22, plus: 28, bar: 32 },
  lg: { name: 44, plus: 52, bar: 100 },
};

function Logo({ size = "md" }: Props) {
  const s = sizes[size];
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.wrapper}>
      <View style={styles.textRow}>
        <Text style={[styles.name, { fontSize: s.name }]}>Economiza</Text>
        <Text style={[styles.plus, { fontSize: s.plus }]}>+</Text>
      </View>
      <View style={[styles.bar, { width: s.bar }]} />
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => 
StyleSheet.create({
  wrapper: {
    alignItems: "center",
    gap: 6,
  },
  textRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  name: {
    fontWeight: "800",
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  plus: {
    fontWeight: "800",
    color: theme.colors.primary,
    lineHeight: undefined,
    marginBottom: -2,
  },
  bar: {
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
});

export default Logo;