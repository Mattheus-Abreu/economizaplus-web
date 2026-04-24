import theme from "@/app/themes/theme";
import { StyleSheet, Text, View } from "react-native"

type Props = {
    title: string;
    subtitle: string;
}

function CategoryInsights({ title, subtitle }: Props) {
  return (
    <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        gap: 5,
        width: 110,
        height: 90,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        borderRadius: 25,
        borderColor: theme.colors.glass,
        borderWidth: 1,
    },
    title: {
        color: theme.colors.textSecondary,
        fontSize: 10,
        fontWeight: "400",
        textTransform: "uppercase",
        letterSpacing: 1.2,
        marginTop: 5,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: "800",
        color: theme.colors.text,
    }
});

export default CategoryInsights;