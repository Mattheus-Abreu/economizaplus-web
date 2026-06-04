import { useTheme } from "@/components/theme-switch/hooks";

export function useAppTheme() {
  const { colors } = useTheme();

  return {
    colors,
    fontSize: {
      title: 24,
      subtitle: 18,
      text: 16,
    },
    spacing: {
      sm: 10,
      md: 20,
      lg: 30,
    },
  };
}