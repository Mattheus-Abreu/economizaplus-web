import { Children } from "react"
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from "react-native"
import theme from "@/app/themes/theme"

type ButtonProps = TouchableOpacityProps & {
    label: string,
    textStyle?: any
}

function Button({ label, children, textStyle, ...rest }: ButtonProps) {
  return (
    
    <TouchableOpacity style={style.container} {...rest} activeOpacity={0.8}>
      {children}
      <Text style={[style.label, textStyle]}>{label}</Text>
    </TouchableOpacity>
    
  )
}

const style = StyleSheet.create({
    container: {
        width: "100%",
        height: 48,
        backgroundColor: "#7446af",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        gap: 8,
        flexDirection: "row"
    },
    label: {
        color: theme.colors.text,
        fontSize: theme.fontSize.text,
        fontWeight: 600
    }
})

export default Button