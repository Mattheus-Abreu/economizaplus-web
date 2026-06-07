import { useAppTheme } from "@/hooks/useAppTheme"
import { Ionicons } from "@expo/vector-icons"
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from "react-native"

type ButtonProps = TouchableOpacityProps & {
    label: string,
    textStyle?: any
}

function Button({ label, children, textStyle, style: styleProp, ...rest }: ButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  return (
    <TouchableOpacity style={[styles.container, styleProp]} {...rest} activeOpacity={0.85}>
      {children}
      <Text style={[styles.label, textStyle]}>{label}</Text>
      <Ionicons name="arrow-forward" size={18} color="#fff"/>
    </TouchableOpacity>
  )
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => 
StyleSheet.create({
    container: {
        width: "100%",
        height: 54,
        backgroundColor: theme.colors.primary,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 16,
        gap: 8,
        flexDirection: "row"
    },
    label: {
        color: "#fff",
        fontSize: theme.fontSize.text,
        fontWeight: "600"
    }
})

export default Button