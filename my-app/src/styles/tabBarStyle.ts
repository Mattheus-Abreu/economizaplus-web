import { StyleSheet } from "react-native";

const tabBarStyle = StyleSheet.create({
  tabbar: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(30, 41, 59, 0.92)",
    paddingVertical: 14,
    borderRadius: 30,
   
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  tabbarItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
});

export default tabBarStyle