import theme from "@/app/themes/theme";
import Button from "@/components/Button";
import Checkbox from "@/components/inputs/Checkbox"
import Screen from "@/components/Screen";
import { Link, useRouter } from "expo-router";
import { useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native"


function finEducation() {
    const [goal, setGoal] = useState<string[]>([]);
    const [preferences, setPreferences] = useState<string[]>([]);
    const router = useRouter();

    function redirectPage() {
        if (goal.length > 0) {
            return router.replace({
            pathname: "/educationalPage/IAScreen",
            params: {
                goals: JSON.stringify(goal)
            }
        });
        }
        Alert.alert("Erro", "Selecione pelo menos um plano para continuar!");
    }

  return (
    <Screen>
        <View style={styles.container}>
            <Text style={styles.title}>Você tem planos para o futuro?</Text>
            <Text style={styles.subtitle}>O Gemini pode te ajudar a se preparar para realizar seus objetivos.{"\n"}Por favor informe os seus planos:</Text>
            <View style={styles.checkboxContainer}>
                <Checkbox
                    options={[
                        { label: "Viagem dos sonhos", value: "Viagem dos sonhos" },
                        { label: "Aposentadoria", value: "Aposentadoria" },
                        { label: "Casa própria", value: "Casa própria" },
                        { label: "Filhos", value: "Filhos" },
                        { label: "Carro", value: "Carro" },
                        { label: "Moto", value: "Moto" },
                        { label: "Casamento", value: "Casamento" },
                        { label: "Outro", value: "Outro" },
                    ]}
                    checkedValues={goal}
                    onChange={setGoal}
                />
            </View>
            <Button label="Continuar" onPress={redirectPage}>
            </Button>
            <Link href="/home" style={styles.link}>Pular</Link>

        </View>
    </Screen>
  )
}


const styles = StyleSheet.create({
    container: {
        gap: 20
    },
    title: {
        fontSize: theme.fontSize.title,
        fontWeight: 900,
        color: theme.colors.text,
        textAlign: "center",
        marginTop: 150
    },
    subtitle:{
        fontSize: theme.fontSize.subtitle,
        fontWeight: 400,
        color: theme.colors.text, 
    },
    checkboxContainer: {
        height: 350,
        marginBottom: 20
    },
    link:{
        fontSize: theme.fontSize.subtitle,
        fontWeight: 900,
        color: theme.colors.text,
        textAlign: "center"
    }
})

export default finEducation