import { StyleSheet } from "react-native";
import theme from "../app/themes/theme";

const signupStyle = StyleSheet.create({
  screen: {
    padding: 24,
    justifyContent: "center",
  },
  logoArea: {
    alignItems: "center",
    marginBottom: 36,
  },
  logo:{
    paddingTop: 20,
    paddingBottom: 20
  },
  header:{
    paddingTop: 100,
    paddingBottom: 30,
    justifyContent: "center",
    alignItems:"center"
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text,
    lineHeight: 34,
  },
  subtitle:{
    fontSize: theme.fontSize.text,
    fontWeight: 400,
    color: theme.colors.textSecondary
  },
  illustration: {
    resizeMode: "contain",
    marginTop: 30,
  },
  form: {
    marginTop: 24,
    gap: 16,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: theme.colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingLeft: 2,
  },
  fieldInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    height: 54,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
  },
  fieldInputActive: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(124,58,237,0.06)",
  },
    inlineInput: {
    flex: 1,
    height: 54,
    backgroundColor: "transparent",
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: 0,
  },
  footerText: {
    textAlign: "center",
    marginTop: 24,
    color: "#d4dee6",
  },
  footerLink: {
    color: theme.colors.primary,
    fontWeight: 700,
  },
});

export default signupStyle;
