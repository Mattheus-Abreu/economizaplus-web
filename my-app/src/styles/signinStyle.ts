import { StyleSheet } from "react-native";
import theme from "../app/themes/theme";

const signinStyle = StyleSheet.create({
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: 900,
    color: theme.colors.text,
  },
  orText: {
    textAlign: "center",
    padding: 12,
    fontSize: theme.fontSize.text,
    fontWeight: 400,
    color: theme.colors.text,
  },
  illustration: {
    resizeMode: "contain",
    marginTop: 62,
  },
  form: {
    marginTop: 24,
    gap: 12,
  },
  googleButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    width: "100%",
    height: 48,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    fontWeight: 800,
  },
  forgotPassword: {
    fontSize: 12,
    textAlign: "right",
    color: "#d4dee6",
    marginBottom: 20,
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
    dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 16,
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  dividerLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: theme.colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});

export default signinStyle;
