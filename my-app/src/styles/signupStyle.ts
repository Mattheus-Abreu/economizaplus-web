import { StyleSheet } from "react-native";
import theme from "../app/themes/theme";

const signupStyle = StyleSheet.create({
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: 900,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.text,
    fontWeight: 400,
    color: theme.colors.text,
  },
  illustration: {
    resizeMode: "contain",
    marginTop: 30,
  },
  form: {
    marginTop: 24,
    gap: 12,
  },
  footerText: {
    textAlign: "center",
    marginTop: 24,
    color: "#d4dee6",
  },
  footerLink: {
    color: "#a26ee7",
    fontWeight: 700,
  },
});

export default signupStyle;
