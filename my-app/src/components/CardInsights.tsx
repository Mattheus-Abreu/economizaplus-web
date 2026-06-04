import { useAppTheme } from "@/hooks/useAppTheme";
import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  subtitle: string | number;
  icon?: ReactNode;
  variant?: "default" | "success" | "danger";
};

function CardInsights({
  title,
  subtitle,
  icon,
  variant = "default",
}: Props) {
  const variantStyle = getVariantStyle(variant);
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.container, variantStyle.container]}>
      {icon && <View style={styles.icon}>{icon}</View>}

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <Text style={[styles.subtitle, variantStyle.subtitle]}>
        {subtitle}
      </Text>
    </View>
  );
}

const getVariantStyle = (variant: Props["variant"]) => {
  const theme = useAppTheme();
  switch (variant) {
    case "success":
      return {
        
        subtitle: { color: theme.colors.secondary },
      };
    case "danger":
      return {
        
        subtitle: { color: "#F44336" },
      };
    default:
      return {
        container: {},
        subtitle: {},
      };
  }
};

const createStyles = (theme: ReturnType<typeof useAppTheme>) => 
StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 100,
    padding: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.glass,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },

  icon: {
    marginBottom: 4,
  },

  title: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },

  subtitle: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.text,
  },
});

export default CardInsights;