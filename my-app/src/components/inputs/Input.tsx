import { StyleSheet, TextInput, TextInputProps } from "react-native"

function Input({...rest}: TextInputProps) {
  return (
    <TextInput style={style.input} {...rest} />
  )
}

const style = StyleSheet.create({
    input: {
        width: "100%",
        height: 48,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        fontSize: 16,
        color: "#d4d4d4",
        paddingLeft: 16,
    }
})

export default Input