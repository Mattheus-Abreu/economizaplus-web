import { useAppTheme } from "@/hooks/useAppTheme";
import { StyleSheet, TextInput, TextInputProps } from "react-native";

function Input({ style: styleProp, ...rest }: TextInputProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  return (
    <TextInput
      style={[styles.input, styleProp]}
      placeholderTextColor={theme.colors.textSecondary}
      {...rest}
    />
  )
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => 
StyleSheet.create({
    input: {
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.1)",
        borderRadius: 14,
        height: 54,
        paddingHorizontal: 16,
        fontSize: 15,
        color: theme.colors.text,
    }
})

export default Input