import { useAppTheme } from "@/hooks/useAppTheme";
import { StyleSheet } from "react-native";

const createStyles = (theme: ReturnType<typeof useAppTheme>) => 
StyleSheet.create({
  container: {
    flex: 1,
  },
  checkBox: {
    height: 60,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  text: {
    fontSize: theme.fontSize.text,
    marginLeft: 15,
    color: theme.colors.text
  },
  checkBoxGroup: {
    flex: 1,
  },
});

export default createStyles;
