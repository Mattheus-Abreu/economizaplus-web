import { useAppTheme } from "@/hooks/useAppTheme";
import { StyleSheet } from "react-native";

const createStyles = (theme: ReturnType<typeof useAppTheme>) => 
StyleSheet.create({
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

export default createStyles;