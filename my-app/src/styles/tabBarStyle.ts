import theme from "@/app/themes/theme";
import { StyleSheet } from "react-native";

const tabBarStyle = StyleSheet.create({
    tabbar: {
        position: "absolute",
        bottom: 50,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "rgb(57, 52, 77)",
        marginHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 30,
        shadowColor: "rgb(69, 63, 92)",
        shadowOffset: {
            width: 0,
            height: 8
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    tabbarItem:{
        flex: 1,
        justifyContent:"center",
        alignItems:"center",
        gap: 5
    }
});

export default tabBarStyle