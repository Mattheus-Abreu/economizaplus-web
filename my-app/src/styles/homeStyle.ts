import theme from "@/app/themes/theme";
import { StyleSheet } from "react-native";

const homeStyle = StyleSheet.create({
    container:{
        flexDirection: 'row',
        justifyContent: 'space-between',  
        marginTop: 90
    },
    title:{
        fontSize: theme.fontSize.title,
        fontWeight: 900,
        color: theme.colors.text
    }
});

export default homeStyle;