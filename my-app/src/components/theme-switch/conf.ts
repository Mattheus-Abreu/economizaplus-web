// config.ts
import { AnimationType, EasingType } from "./types";

export const darkTheme = {
  background: "#0E0B1E",
  foreground: "#F0EEFF",
  surface: "#1A1530",
  card: "#1A1530",
  text: "#F0EEFF",
  textSecondary: "#9A94C0",
  primary: "#7C3AED",
  primaryForeground: "#FFFFFF",
  secondary: "#2A9D6E",
  secondaryForeground: "#FFFFFF",
  accent: "#5DA8D4",
  accentForeground: "#FFFFFF",
  border: "rgba(167,139,250,0.12)",
  destructive: "#E05C7A",
  destructiveForeground: "#FFFFFF",
  muted: "#2A1A40",
  mutedForeground: "#7C6FAB",
  success: "#3ECFA0",
  warning: "#FCA370",
  info: "#72B3E8",
  glass: "rgba(167,139,250,0.08)",
};

export const lightTheme = {
  background: "#F5F1FF",
  foreground: "#1C1240",
  surface: "#EDE8FF",
  card: "#FFFFFF",
  text: "#1C1240",
  textSecondary: "#6B5F9E",
  primary: "#7C3AED",
  primaryForeground: "#FFFFFF",
  secondary: "#17876A",
  secondaryForeground: "#FFFFFF",
  accent: "#0F87C0",
  accentForeground: "#FFFFFF",
  border: "#CFC5F5",
  destructive: "#C8365C",
  destructiveForeground: "#FFFFFF",
  muted: "#F0EBFF",
  mutedForeground: "#9080CC",
  success: "#0F7A56",
  warning: "#C96A1A",
  info: "#1769B5",
  glass: "rgba(109,68,196,0.08)",
};

// Default animation settings
export const DEFAULT_ANIMATION_DURATION = 600;
export const DEFAULT_ANIMATION_TYPE = AnimationType.Circular;
export const DEFAULT_SWITCH_DELAY = 80;
export const DEFAULT_EASING = EasingType.EaseInOut;
