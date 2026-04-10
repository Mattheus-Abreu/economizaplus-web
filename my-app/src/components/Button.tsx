import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from "react-native"
import theme from "@/app/themes/theme"
import { Ionicons } from "@expo/vector-icons"

type ButtonProps = TouchableOpacityProps & {
    label: string,
    textStyle?: any
}

function Button({ label, children, textStyle, style: styleProp, ...rest }: ButtonProps) {
  return (
    <TouchableOpacity style={[style.container, styleProp]} {...rest} activeOpacity={0.85}>
      {children}
      <Text style={[style.label, textStyle]}>{label}</Text>
      <Ionicons name="arrow-forward" size={18} color="#fff" />
    </TouchableOpacity>
  )
}

const style = StyleSheet.create({
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
        color: theme.colors.text,
        fontSize: theme.fontSize.text,
        fontWeight: "600"
    }
})

export default Button